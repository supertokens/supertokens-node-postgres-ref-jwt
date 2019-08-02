"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : new P(function(resolve) {
                          resolve(result.value);
                      }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const cookieAndHeaders_1 = require("./cookieAndHeaders");
const error_1 = require("./error");
const SessionFunctions = require("./session");
var error_2 = require("./error");
exports.Error = error_2.AuthError;
/**
 * @description: to be called by user of the library. This initiates all the modules necessary for this library to work.
 * Please create a database in your mongo instance before calling this function
 * @param config
 * @param client: mongo client. Default is undefined. If you provide this, please make sure that it is already connected to the right database that has the auth collections. If you do not provide this, then the library will manage its own connection.
 * @throws AuthError GENERAL_ERROR in case anything fails.
 */
function init(config) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.init(config);
    });
}
exports.init = init;
/**
 * @description call this to "login" a user. This overwrites any existing session that exists.
 * To check if a session exists, call getSession function.
 * @throws GENERAL_ERROR in case anything fails.
 * @sideEffect sets cookies in res
 */
function createNewSession(res, userId, jwtPayload, sessionData) {
    return __awaiter(this, void 0, void 0, function*() {
        let response = yield SessionFunctions.createNewSession(userId, jwtPayload, sessionData);
        // attach tokens to cookies
        cookieAndHeaders_1.attachAccessTokenToCookie(res, response.accessToken.value, response.accessToken.expires);
        cookieAndHeaders_1.attachRefreshTokenToCookie(res, response.refreshToken.value, response.refreshToken.expires);
        cookieAndHeaders_1.attachIdRefreshTokenToCookie(
            res,
            response.idRefreshToken.value,
            response.idRefreshToken.expires
        );
        cookieAndHeaders_1.setAntiCsrfTokenInHeadersIfRequired(res, response.antiCsrfToken);
        return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
    });
}
exports.createNewSession = createNewSession;
/**
 * @description authenticates a session. To be used in APIs that require authentication
 * @throws AuthError, GENERAL_ERROR, UNAUTHORISED and TRY_REFRESH_TOKEN
 * @sideEffects may remove cookies, or change the accessToken.
 */
function getSession(req, res, enableCsrfProtection) {
    return __awaiter(this, void 0, void 0, function*() {
        let idRefreshToken = cookieAndHeaders_1.getIdRefreshTokenFromCookie(req);
        if (idRefreshToken === undefined) {
            // This means refresh token is not going to be there either, so the session does not exist.
            cookieAndHeaders_1.clearSessionFromCookie(res);
            throw error_1.generateError(error_1.AuthError.UNAUTHORISED, new Error("missing auth tokens in cookies"));
        }
        let accessToken = cookieAndHeaders_1.getAccessTokenFromCookie(req);
        if (accessToken === undefined) {
            // maybe the access token has expired.
            throw error_1.generateError(
                error_1.AuthError.TRY_REFRESH_TOKEN,
                new Error("access token missing in cookies")
            );
        }
        try {
            if (typeof enableCsrfProtection !== "boolean") {
                throw error_1.generateError(
                    error_1.AuthError.GENERAL_ERROR,
                    Error("you need to pass enableCsrfProtection boolean")
                );
            }
            let config = config_1.default.get();
            enableCsrfProtection = enableCsrfProtection && config.tokens.enableAntiCsrf;
            let antiCsrfToken = enableCsrfProtection ? cookieAndHeaders_1.getAntiCsrfTokenFromHeaders(req) : undefined;
            if (enableCsrfProtection && antiCsrfToken === undefined) {
                throw error_1.generateError(
                    error_1.AuthError.TRY_REFRESH_TOKEN,
                    Error("anti-csrf token not found in headers")
                );
            }
            let response = yield SessionFunctions.getSession(
                accessToken,
                antiCsrfToken === undefined ? null : antiCsrfToken
            );
            if (response.newAccessToken !== undefined) {
                cookieAndHeaders_1.attachAccessTokenToCookie(
                    res,
                    response.newAccessToken.value,
                    response.newAccessToken.expires
                );
            }
            return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
        } catch (err) {
            if (error_1.AuthError.isErrorFromAuth(err) && err.errType === error_1.AuthError.UNAUTHORISED) {
                cookieAndHeaders_1.clearSessionFromCookie(res);
            }
            throw err;
        }
    });
}
exports.getSession = getSession;
/**
 * @description generates new access and refresh tokens for a given refresh token. Called when client's access token has expired.
 * @throws AuthError, GENERAL_ERROR, UNAUTHORISED, UNAUTHORISED_AND_TOKEN_THEFT_DETECTED
 * @sideEffects may remove cookies, or change the accessToken and refreshToken.
 */
function refreshSession(req, res) {
    return __awaiter(this, void 0, void 0, function*() {
        let config = config_1.default.get();
        let refreshToken = cookieAndHeaders_1.getRefreshTokenFromCookie(req);
        let idRefreshToken = cookieAndHeaders_1.getIdRefreshTokenFromCookie(req);
        if (refreshToken === undefined || idRefreshToken === undefined) {
            cookieAndHeaders_1.clearSessionFromCookie(res);
            throw error_1.generateError(error_1.AuthError.UNAUTHORISED, new Error("missing auth tokens in cookies"));
        }
        try {
            let response = yield SessionFunctions.refreshSession(refreshToken);
            // attach tokens to cookies
            cookieAndHeaders_1.attachAccessTokenToCookie(
                res,
                response.newAccessToken.value,
                response.newAccessToken.expires
            );
            cookieAndHeaders_1.attachRefreshTokenToCookie(
                res,
                response.newRefreshToken.value,
                response.newRefreshToken.expires
            );
            cookieAndHeaders_1.attachIdRefreshTokenToCookie(
                res,
                response.newIdRefreshToken.value,
                response.newIdRefreshToken.expires
            );
            cookieAndHeaders_1.setAntiCsrfTokenInHeadersIfRequired(res, response.newAntiCsrfToken);
            return new Session(response.session.handle, response.session.userId, response.session.jwtPayload, res);
        } catch (err) {
            if (
                error_1.AuthError.isErrorFromAuth(err) &&
                (err.errType === error_1.AuthError.UNAUTHORISED ||
                    err.errType === error_1.AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED)
            ) {
                cookieAndHeaders_1.clearSessionFromCookie(res);
            }
            throw err;
        }
    });
}
exports.refreshSession = refreshSession;
/**
 * @description deletes session info of a user from db. This only invalidates the refresh token. Not the access token.
 * Access tokens cannot be immediately invalidated, unless we enable a blacklisting. Or changed the private key to sign them.
 * @throws AuthError, GENERAL_ERROR
 */
function revokeAllSessionsForUser(userId) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.revokeAllSessionsForUser(userId);
    });
}
exports.revokeAllSessionsForUser = revokeAllSessionsForUser;
/**
 * @description gets all session handles for current user. Please do not call this unless this user is authenticated.
 * @throws AuthError, GENERAL_ERROR
 */
function getAllSessionHandlesForUser(userId) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.getAllSessionHandlesForUser(userId);
    });
}
exports.getAllSessionHandlesForUser = getAllSessionHandlesForUser;
/**
 * @description call to destroy one session. This will not clear cookies, so if you have a Session object, please use that.
 * @returns true if session was deleted from db. Else false in case there was nothing to delete
 * @throws AuthError, GENERAL_ERROR
 */
function revokeSessionUsingSessionHandle(sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.revokeSessionUsingSessionHandle(sessionHandle);
    });
}
exports.revokeSessionUsingSessionHandle = revokeSessionUsingSessionHandle;
/**
 * @description: this function reads from the database every time. It provides no locking mechanism in case other processes are updating session data for this session as well, so please take of that by yourself. If you have a Session object, please use that instead.
 * @returns session data as provided by the user earlier
 * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
 */
function getSessionData(sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.getSessionData(sessionHandle);
    });
}
exports.getSessionData = getSessionData;
/**
 * @description: It provides no locking mechanism in case other processes are updating session data for this session as well. If you have a Session object, please use that instead.
 * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
 */
function updateSessionData(sessionHandle, newSessionData) {
    return __awaiter(this, void 0, void 0, function*() {
        return SessionFunctions.updateSessionData(sessionHandle, newSessionData);
    });
}
exports.updateSessionData = updateSessionData;
/**
 * @description Sets relevant Access-Control-Allow-Headers and Access-Control-Allow-Credentials headers
 */
function setRelevantHeadersForOptionsAPI(res) {
    return __awaiter(this, void 0, void 0, function*() {
        cookieAndHeaders_1.setOptionsAPIHeader(res);
    });
}
exports.setRelevantHeadersForOptionsAPI = setRelevantHeadersForOptionsAPI;
/**
 * @class Session
 * @description an instance of this is created when a session is valid.
 */
class Session {
    constructor(sessionHandle, userId, jwtUserPayload, res) {
        /**
         * @description call this to logout the current user.
         * This only invalidates the refresh token. The access token can still be used after
         * @sideEffect may clear cookies from response.
         * @throw AuthError GENERAL_ERROR
         */
        this.revokeSession = () =>
            __awaiter(this, void 0, void 0, function*() {
                if (yield SessionFunctions.revokeSessionUsingSessionHandle(this.sessionHandle)) {
                    cookieAndHeaders_1.clearSessionFromCookie(this.res);
                }
            });
        /**
         * @description: this function reads from the database every time. It provides no locking mechanism in case other processes are updating session data for this session as well, so please take of that by yourself.
         * @returns session data as provided by the user earlier
         * @sideEffect may clear cookies from response.
         * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
         */
        this.getSessionData = () =>
            __awaiter(this, void 0, void 0, function*() {
                try {
                    return yield SessionFunctions.getSessionData(this.sessionHandle);
                } catch (err) {
                    if (error_1.AuthError.isErrorFromAuth(err) && err.errType === error_1.AuthError.UNAUTHORISED) {
                        cookieAndHeaders_1.clearSessionFromCookie(this.res);
                    }
                    throw err;
                }
            });
        /**
         * @description: It provides no locking mechanism in case other processes are updating session data for this session as well.
         * @param newSessionData this can be anything: an array, a promitive type, object etc etc. This will overwrite the current value stored in the database.
         * @sideEffect may clear cookies from response.
         * @throws AuthError GENERAL_ERROR, UNAUTHORISED.
         */
        this.updateSessionData = newSessionData =>
            __awaiter(this, void 0, void 0, function*() {
                try {
                    yield SessionFunctions.updateSessionData(this.sessionHandle, newSessionData);
                } catch (err) {
                    if (error_1.AuthError.isErrorFromAuth(err) && err.errType === error_1.AuthError.UNAUTHORISED) {
                        cookieAndHeaders_1.clearSessionFromCookie(this.res);
                    }
                    throw err;
                }
            });
        this.getUserId = () => {
            return this.userId;
        };
        this.getJWTPayload = () => {
            return this.jwtUserPayload;
        };
        this.sessionHandle = sessionHandle;
        this.userId = userId;
        this.jwtUserPayload = jwtUserPayload;
        this.res = res;
    }
}
exports.Session = Session;
//# sourceMappingURL=express.js.map
