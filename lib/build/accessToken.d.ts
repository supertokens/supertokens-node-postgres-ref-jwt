/**
 * @description called during library init. Should be called after initing Config and MySQL.
 * @throws AuthError GENERAL_ERROR
 */
export declare function init(): Promise<void>;
/**
 * @description called during testing only
 */
export declare function reset(): void;
/**
 * @description called during testing only
 */
export declare function getKeyForTesting(): Promise<string>;
/**
 * @description given a token, it verifies it, checks the payload type and returns the payload contained in it
 * @throws AuthError GENERAL_ERROR TRY_REFRESH_TOKEN
 */
export declare function getInfoFromAccessToken(token: string, retry?: boolean): Promise<{
    sessionHandle: string;
    userId: string | number;
    refreshTokenHash1: string;
    expiryTime: number;
    parentRefreshTokenHash1: string | undefined;
    userPayload: any;
    antiCsrfToken: string | undefined;
}>;
/**
 * @description given token payload, it creates a new token that is signed by a key stored in the DB.
 * @throws AuthError GENERAL_ERROR
 */
export declare function createNewAccessToken(sessionHandle: string, userId: string | number, refreshTokenHash1: string, antiCsrfToken: string | undefined, parentRefreshTokenHash1: string | undefined, userPayload: any): Promise<{
    token: string;
    expiry: number;
}>;
