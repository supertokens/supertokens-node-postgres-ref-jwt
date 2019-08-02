import * as express from "express";

import Config from "./config";
import {
    attachAccessTokenToCookie,
    attachIdRefreshTokenToCookie,
    attachRefreshTokenToCookie,
    clearSessionFromCookie,
    getAccessTokenFromCookie,
    getAntiCsrfTokenFromHeaders,
    getIdRefreshTokenFromCookie,
    getRefreshTokenFromCookie,
    setAntiCsrfTokenInHeadersIfRequired,
    setOptionsAPIHeader
} from "./cookieAndHeaders";
import { AuthError, generateError } from "./error";
import { TypeInputConfig } from "./helpers/types";
import * as SessionFunctions from "./session";

export { AuthError as Error } from "./error";

/**
 * @description: to be called by user of the library. This initiates all the modules necessary for this library to work.
 * Please create a database in your mongo instance before calling this function
 * @param config
 * @param client: mongo client. Default is undefined. If you provide this, please make sure that it is already connected to the right database that has the auth collections. If you do not provide this, then the library will manage its own connection.
 * @throws AuthError GENERAL_ERROR in case anything fails.
 */
export async function init(config: TypeInputConfig) {
    return SessionFunctions.init(config);
}

/**
 * @description call this to "login" a user. This overwrites any existing session that exists.
 * To check if a session exists, call getSession function.
 * @throws GENERAL_ERROR in case anything fails.
 * @sideEffect sets cookies in res
 */
export async function createNewSession(
    res: express.Response,
    userId: string | number,
    jwtPayload?: any,
    sessionData?: any
): Promise<Session> {
    let response = await SessionFunctions.createNewSession(userId, jwtPayload, sessionData);

    // attach tokens to cookies
    attachAccessTokenToCookie(res, response.accessToken.value, response.accessToken.expires);
    attachRefreshTokenToCookie(res, response.refreshToken.value, response.refreshToken.expires);
    attachIdRefreshTokenToCookie(res, response.idRefreshToken.value, response.idRefreshToken.expires);
    setAntiCsrfTokenInHeadersIfRequired(res, response.antiCsrfToken);

    return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
}

/**
 * @description authenticates a session. To be used in APIs that require authentication
 * @throws AuthError, GENERAL_ERROR, UNAUTHORISED and TRY_REFRESH_TOKEN
 * @sideEffects may remove cookies, or change the accessToken.
 */
export async function getSession(
    req: express.Request,
    res: express.Response,
    enableCsrfProtection: boolean
): Promise<Session> {
    let idRefreshToken = getIdRefreshTokenFromCookie(req);
    if (idRefreshToken === undefined) {
        // This means refresh token is not going to be there either, so the session does not exist.
        clearSessionFromCookie(res);
        throw generateError(AuthError.UNAUTHORISED, new Error("missing auth tokens in cookies"));
    }

    let accessToken = getAccessTokenFromCookie(req);
    if (accessToken === undefined) {
        // maybe the access token has expired.
        throw generateError(AuthError.TRY_REFRESH_TOKEN, new Error("access token missing in cookies"));
    }

    try {
        if (typeof enableCsrfProtection !== "boolean") {
            throw generateError(AuthError.GENERAL_ERROR, Error("you need to pass enableCsrfProtection boolean"));
        }
        let config = Config.get();
        enableCsrfProtection = enableCsrfProtection && config.tokens.enableAntiCsrf;
        let antiCsrfToken = enableCsrfProtection ? getAntiCsrfTokenFromHeaders(req) : undefined;
        if (enableCsrfProtection && antiCsrfToken === undefined) {
            throw generateError(AuthError.TRY_REFRESH_TOKEN, Error("anti-csrf token not found in headers"));
        }
        let response = await SessionFunctions.getSession(
            accessToken,
            antiCsrfToken === undefined ? null : antiCsrfToken
        );
        if (response.newAccessToken !== undefined) {
            attachAccessTokenToCookie(res, response.newAccessToken.value, response.newAccessToken.expires);
        }
        return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
    } catch (err) {
        if (AuthError.isErrorFromAuth(err) && err.errType === AuthError.UNAUTHORISED) {
            clearSessionFromCookie(res);
        }
        throw err;
    }
}

/**
 * @description generates new access and refresh tokens for a given refresh token. Called when client's access token has expired.
 * @throws AuthError, GENERAL_ERROR, UNAUTHORISED, UNAUTHORISED_AND_TOKEN_THEFT_DETECTED
 * @sideEffects may remove cookies, or change the accessToken and refreshToken.
 */
export async function refreshSession(req: express.Request, res: express.Response): Promise<Session> {
    let config = Config.get();

    let refreshToken = getRefreshTokenFromCookie(req);
    let idRefreshToken = getIdRefreshTokenFromCookie(req);
    if (refreshToken === undefined || idRefreshToken === undefined) {
        clearSessionFromCookie(res);
        throw generateError(AuthError.UNAUTHORISED, new Error("missing auth tokens in cookies"));
    }

    try {
        let response = await SessionFunctions.refreshSession(refreshToken);
        // attach tokens to cookies
        attachAccessTokenToCookie(res, response.newAccessToken.value, response.newAccessToken.expires);
        attachRefreshTokenToCookie(res, response.newRefreshToken.value, response.newRefreshToken.expires);
        attachIdRefreshTokenToCookie(res, response.newIdRefreshToken.value, response.newIdRefreshToken.expires);
        setAntiCsrfTokenInHeadersIfRequired(res, response.newAntiCsrfToken);

        return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
    } catch (err) {
        if (
            AuthError.isErrorFromAuth(err) &&
            (err.errType === AuthError.UNAUTHORISED || err.errType === AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED)
        ) {
            clearSessionFromCookie(res);
        }
        throw err;
    }
}

/**
 * @description deletes session info of a user from db. This only invalidates the refresh token. Not the access token.
 * Access tokens cannot be immediately invalidated, unless we enable a blacklisting. Or changed the private key to sign them.
 * @throws AuthError, GENERAL_ERROR
 */
export async function revokeAllSessionsForUser(userId: string | number) {
    return SessionFunctions.revokeAllSessionsForUser(userId);
}

/**
 * @description gets all session handles for current user. Please do not call this unless this user is authenticated.
 * @throws AuthError, GENERAL_ERROR
 */
export async function getAllSessionHandlesForUser(userId: string | number): Promise<string[]> {
    return SessionFunctions.getAllSessionHandlesForUser(userId);
}

/**
 * @description call to destroy one session. This will not clear cookies, so if you have a Session object, please use that.
 * @returns true if session was deleted from db. Else false in case there was nothing to delete
 * @throws AuthError, GENERAL_ERROR
 */
export async function revokeSessionUsingSessionHandle(sessionHandle: string): Promise<boolean> {
    return SessionFunctions.revokeSessionUsingSessionHandle(sessionHandle);
}

/**
 * @description: this function reads from the database every time. It provides no locking mechanism in case other processes are updating session data for this session as well, so please take of that by yourself. If you have a Session object, please use that instead.
 * @returns session data as provided by the user earlier
 * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
 */
export async function getSessionData(sessionHandle: string): Promise<any> {
    return SessionFunctions.getSessionData(sessionHandle);
}

/**
 * @description: It provides no locking mechanism in case other processes are updating session data for this session as well. If you have a Session object, please use that instead.
 * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
 */
export async function updateSessionData(sessionHandle: string, newSessionData: any) {
    return SessionFunctions.updateSessionData(sessionHandle, newSessionData);
}

/**
 * @description Sets relevant Access-Control-Allow-Headers and Access-Control-Allow-Credentials headers
 */
export async function setRelevantHeadersForOptionsAPI(res: express.Response) {
    setOptionsAPIHeader(res);
}

/**
 * @class Session
 * @description an instance of this is created when a session is valid.
 */
export class Session {
    private sessionHandle: string;
    private userId: string | number;
    private jwtUserPayload: any;
    private res: express.Response;

    constructor(sessionHandle: string, userId: string | number, jwtUserPayload: any, res: express.Response) {
        this.sessionHandle = sessionHandle;
        this.userId = userId;
        this.jwtUserPayload = jwtUserPayload;
        this.res = res;
    }

    /**
     * @description call this to logout the current user.
     * This only invalidates the refresh token. The access token can still be used after
     * @sideEffect may clear cookies from response.
     * @throw AuthError GENERAL_ERROR
     */
    revokeSession = async () => {
        if (await SessionFunctions.revokeSessionUsingSessionHandle(this.sessionHandle)) {
            clearSessionFromCookie(this.res);
        }
    };

    /**
     * @description: this function reads from the database every time. It provides no locking mechanism in case other processes are updating session data for this session as well, so please take of that by yourself.
     * @returns session data as provided by the user earlier
     * @sideEffect may clear cookies from response.
     * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
     */
    getSessionData = async (): Promise<any> => {
        try {
            return await SessionFunctions.getSessionData(this.sessionHandle);
        } catch (err) {
            if (AuthError.isErrorFromAuth(err) && err.errType === AuthError.UNAUTHORISED) {
                clearSessionFromCookie(this.res);
            }
            throw err;
        }
    };

    /**
     * @description: It provides no locking mechanism in case other processes are updating session data for this session as well.
     * @param newSessionData this can be anything: an array, a promitive type, object etc etc. This will overwrite the current value stored in the database.
     * @sideEffect may clear cookies from response.
     * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
     */
    updateSessionData = async (newSessionData: any) => {
        try {
            await SessionFunctions.updateSessionData(this.sessionHandle, newSessionData);
        } catch (err) {
            if (AuthError.isErrorFromAuth(err) && err.errType === AuthError.UNAUTHORISED) {
                clearSessionFromCookie(this.res);
            }
            throw err;
        }
    };

    getUserId = () => {
        return this.userId;
    };

    getJWTPayload = () => {
        return this.jwtUserPayload;
    };
}
