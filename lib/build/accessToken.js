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
const error_1 = require("./error");
const dbQueries_1 = require("./helpers/dbQueries");
const JWT = require("./helpers/jwt");
const mysql_1 = require("./helpers/mysql");
const utils_1 = require("./helpers/utils");
/**
 * @description called during library init. Should be called after initing Config and MySQL.
 * @throws AuthError GENERAL_ERROR
 */
function init() {
    return __awaiter(this, void 0, void 0, function*() {
        let config = config_1.default.get();
        yield SigningKey.init(config);
    });
}
exports.init = init;
/**
 * @description called during testing only
 */
function reset() {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    SigningKey.reset();
}
exports.reset = reset;
/**
 * @description called during testing only
 */
function getKeyForTesting() {
    return __awaiter(this, void 0, void 0, function*() {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        return yield SigningKey.getKey();
    });
}
exports.getKeyForTesting = getKeyForTesting;
/**
 * @description given a token, it verifies it, checks the payload type and returns the payload contained in it
 * @throws AuthError GENERAL_ERROR TRY_REFRESH_TOKEN
 */
function getInfoFromAccessToken(token, retry = true) {
    return __awaiter(this, void 0, void 0, function*() {
        let signingKey = yield SigningKey.getKey();
        try {
            let payload;
            try {
                payload = JWT.verifyJWTAndGetPayload(token, signingKey); // if this fails, then maybe the signing key has changed. So we ask the user to try refresh token.
            } catch (err) {
                if (retry) {
                    SigningKey.removeKeyFromMemory(); // remove key from memory and retry
                    return yield getInfoFromAccessToken(token, false);
                } else {
                    throw err;
                }
            }
            let sessionHandle = utils_1.sanitizeStringInput(payload.sessionHandle);
            let userId =
                utils_1.sanitizeNumberInput(payload.userId) === undefined
                    ? utils_1.sanitizeStringInput(payload.userId)
                    : utils_1.sanitizeNumberInput(payload.userId);
            let refreshTokenHash1 = utils_1.sanitizeStringInput(payload.rt);
            let expiryTime = utils_1.sanitizeNumberInput(payload.expiryTime);
            let parentRefreshTokenHash1 = utils_1.sanitizeStringInput(payload.prt);
            let antiCsrfToken = utils_1.sanitizeStringInput(payload.antiCsrfToken);
            let userPayload = payload.userPayload;
            if (
                sessionHandle === undefined ||
                userId === undefined ||
                refreshTokenHash1 === undefined ||
                expiryTime === undefined ||
                (antiCsrfToken === undefined && config_1.default.get().tokens.enableAntiCsrf)
            ) {
                // it would come here if we change the structure of the JWT.
                throw Error("invalid access token payload");
            }
            if (expiryTime < Date.now()) {
                throw Error("expired access token");
            }
            return {
                sessionHandle,
                userId,
                refreshTokenHash1,
                expiryTime,
                parentRefreshTokenHash1,
                userPayload,
                antiCsrfToken
            };
        } catch (err) {
            throw error_1.generateError(error_1.AuthError.TRY_REFRESH_TOKEN, err);
        }
    });
}
exports.getInfoFromAccessToken = getInfoFromAccessToken;
/**
 * @description given token payload, it creates a new token that is signed by a key stored in the DB.
 * @throws AuthError GENERAL_ERROR
 */
function createNewAccessToken(
    sessionHandle,
    userId,
    refreshTokenHash1,
    antiCsrfToken,
    parentRefreshTokenHash1,
    userPayload
) {
    return __awaiter(this, void 0, void 0, function*() {
        let config = config_1.default.get();
        let signingKey = yield SigningKey.getKey();
        let expiry = Date.now() + config.tokens.accessToken.validity;
        let token = JWT.createJWT(
            {
                sessionHandle,
                userId,
                rt: refreshTokenHash1,
                antiCsrfToken,
                prt: parentRefreshTokenHash1,
                expiryTime: expiry,
                userPayload
            },
            signingKey
        );
        return { token, expiry };
    });
}
exports.createNewAccessToken = createNewAccessToken;
const ACCESS_TOKEN_SIGNING_KEY_NAME_IN_DB = "access_token_signing_key";
/**
 * @class SigningKey
 * @description this is a singleton class since there is just one key in the whole system for access tokens
 */
class SigningKey {
    constructor(config) {
        this.removeKeyFromMemoryInInstance = () => {
            this.key = undefined;
        };
        this.getKeyFromInstance = () =>
            __awaiter(this, void 0, void 0, function*() {
                if (this.getKeyFromUser !== undefined) {
                    // the user has provided their own function for this so use that.
                    try {
                        return yield this.getKeyFromUser();
                    } catch (err) {
                        throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
                    }
                }
                if (this.key === undefined) {
                    this.key = yield this.maybeGenerateNewKeyAndUpdateInDb();
                }
                if (this.dynamic && Date.now() > this.key.createdAtTime + this.updateInterval) {
                    // key has expired, we need to change it.
                    this.key = yield this.maybeGenerateNewKeyAndUpdateInDb();
                }
                return this.key.keyValue;
            });
        /**
         * @description Maybe generates a new key in a way that takes race conditions in account in case there are multiple node processes running.
         */
        this.maybeGenerateNewKeyAndUpdateInDb = () =>
            __awaiter(this, void 0, void 0, function*() {
                let connection = yield mysql_1.getConnection();
                try {
                    yield connection.startTransaction();
                    let key = yield dbQueries_1.getKeyValueFromKeyName_Transaction(
                        connection,
                        ACCESS_TOKEN_SIGNING_KEY_NAME_IN_DB
                    );
                    let generateNewKey = false;
                    if (key !== undefined) {
                        // read key may have expired. Or if we called this function to change an expired key, then some other process may have already done so.
                        if (this.dynamic && Date.now() > key.createdAtTime + this.updateInterval) {
                            generateNewKey = true;
                        }
                    }
                    if (key === undefined || generateNewKey) {
                        let keyValue = yield utils_1.generateNewSigningKey();
                        key = {
                            keyValue,
                            createdAtTime: Date.now()
                        };
                        yield dbQueries_1.insertKeyValueForKeyName_Transaction(
                            connection,
                            ACCESS_TOKEN_SIGNING_KEY_NAME_IN_DB,
                            key.keyValue,
                            key.createdAtTime
                        );
                    }
                    yield connection.commit();
                    return key;
                } finally {
                    connection.closeConnection();
                }
            });
        this.dynamic = config.tokens.accessToken.signingKey.dynamic;
        this.updateInterval = config.tokens.accessToken.signingKey.updateInterval;
        this.getKeyFromUser = config.tokens.accessToken.signingKey.get;
    }
}
/**
 * @description called when libraries' init is called. Creates and stores a signing key to be used if not already there.
 */
SigningKey.init = config =>
    __awaiter(this, void 0, void 0, function*() {
        if (SigningKey.instance === undefined) {
            SigningKey.instance = new SigningKey(config);
            yield SigningKey.getKey();
        }
    });
/**
 * @description used during testing only
 * The key in the database will be removed by the /helpers/utils - reset
 */
SigningKey.reset = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    SigningKey.instance = undefined;
};
SigningKey.removeKeyFromMemory = () => {
    if (SigningKey.instance === undefined) {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("please call init function of access token signing key")
        );
    }
    SigningKey.instance.removeKeyFromMemoryInInstance();
};
SigningKey.getKey = () =>
    __awaiter(this, void 0, void 0, function*() {
        if (SigningKey.instance === undefined) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error("please call init function of access token signing key")
            );
        }
        return yield SigningKey.instance.getKeyFromInstance();
    });
//# sourceMappingURL=accessToken.js.map
