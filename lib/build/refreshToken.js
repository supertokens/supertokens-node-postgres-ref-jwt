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
const mysql_1 = require("./helpers/mysql");
const utils_1 = require("./helpers/utils");
/**
 * @description: called during library init. Should be called after initing Config and MySQL.
 */
function init() {
    return __awaiter(this, void 0, void 0, function*() {
        let config = config_1.default.get();
        yield Key.init();
    });
}
exports.init = init;
/**
 * @description used during testing only.
 */
function reset() {
    return __awaiter(this, void 0, void 0, function*() {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        Key.reset();
    });
}
exports.reset = reset;
/**
 * @description used during testing only.
 */
function getKeyForTesting() {
    return __awaiter(this, void 0, void 0, function*() {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        return yield Key.getKey();
    });
}
exports.getKeyForTesting = getKeyForTesting;
/**
 * @description given a token, it verifies it with the stored signature and returns the payload contained in it
 * @throws AuthError GENERAL_ERROR UNAUTHORISED
 */
function getInfoFromRefreshToken(token) {
    return __awaiter(this, void 0, void 0, function*() {
        let key = yield Key.getKey();
        try {
            let splittedToken = token.split(".");
            if (splittedToken.length !== 2) {
                throw Error("invalid refresh token");
            }
            let nonce = splittedToken[1];
            let payload = JSON.parse(yield utils_1.decrypt(splittedToken[0], key));
            let sessionHandle = utils_1.sanitizeStringInput(payload.sessionHandle);
            let userId =
                utils_1.sanitizeNumberInput(payload.userId) === undefined
                    ? utils_1.sanitizeStringInput(payload.userId)
                    : utils_1.sanitizeNumberInput(payload.userId);
            let prt = utils_1.sanitizeStringInput(payload.prt);
            let nonceFromEnc = utils_1.sanitizeStringInput(payload.nonce);
            if (sessionHandle === undefined || userId === undefined || nonceFromEnc !== nonce) {
                throw Error("invalid refresh token");
            }
            return {
                sessionHandle,
                userId,
                parentRefreshTokenHash1: prt
            };
        } catch (err) {
            throw error_1.generateError(error_1.AuthError.UNAUTHORISED, err);
        }
    });
}
exports.getInfoFromRefreshToken = getInfoFromRefreshToken;
/**
 * @description given token payload, it creates a new token that is signed by a key stored in the DB.
 * Note: The expiry time of the token is not in the token itself. This may result in the token being alive for a longer duration
 * than what is desired. We can easily fix this by adding the expiry time in the token
 * @throws AuthError GENERAL_ERROR
 */
function createNewRefreshToken(sessionHandle, userId, parentRefreshTokenHash1) {
    return __awaiter(this, void 0, void 0, function*() {
        // token = key1({funcArgs + nonce}).nonce where key1(a) = a encrypted using key1
        // we have the nonce for 2 reasons: given same arguments, the token would be different,
        // and it can be used to verify that the token was indeed created by us.
        let config = config_1.default.get();
        let key = yield Key.getKey();
        let nonce = utils_1.hash(utils_1.generateUUID());
        let payloadSerialised = JSON.stringify({
            sessionHandle,
            userId,
            prt: parentRefreshTokenHash1,
            nonce
        });
        let encryptedPart = yield utils_1.encrypt(payloadSerialised, key);
        return {
            token: encryptedPart + "." + nonce,
            expiry: Date.now() + config.tokens.refreshToken.validity
        };
    });
}
exports.createNewRefreshToken = createNewRefreshToken;
const REFRESH_TOKEN_KEY_NAME_IN_DB = "refresh_token_key";
/**
 * @class Key
 * @description this is a singleton class since there is just one key in the whole system for refresh tokens
 */
class Key {
    constructor() {
        this.getKeyFromInstance = () =>
            __awaiter(this, void 0, void 0, function*() {
                if (this.key === undefined) {
                    this.key = yield this.generateNewKeyAndUpdateInDb();
                }
                return this.key;
            });
        /**
         * @description Generates a new key in a way that takes race conditions in account in case there are multiple node processes running.
         */
        this.generateNewKeyAndUpdateInDb = () =>
            __awaiter(this, void 0, void 0, function*() {
                let connection = yield mysql_1.getConnection();
                try {
                    yield connection.startTransaction();
                    let key = yield dbQueries_1.getKeyValueFromKeyName_Transaction(
                        connection,
                        REFRESH_TOKEN_KEY_NAME_IN_DB
                    );
                    if (key === undefined) {
                        let keyValue = yield utils_1.generateNewSigningKey();
                        key = {
                            keyValue,
                            createdAtTime: Date.now()
                        };
                        yield dbQueries_1.insertKeyValueForKeyName_Transaction(
                            connection,
                            REFRESH_TOKEN_KEY_NAME_IN_DB,
                            key.keyValue,
                            key.createdAtTime
                        );
                    }
                    yield connection.commit();
                    return key.keyValue;
                } finally {
                    connection.closeConnection();
                }
            });
    }
}
/**
 * @description called when libraries' init is called. Creates and stores an encryption/decryption key to be used if not already there.
 */
Key.init = () =>
    __awaiter(this, void 0, void 0, function*() {
        if (Key.instance === undefined) {
            Key.instance = new Key();
            yield Key.getKey();
        }
    });
/**
 * @description used during testing only
 * The key in the database will be removed by the /helpers/utils - reset
 */
Key.reset = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    Key.instance = undefined;
};
Key.getKey = () =>
    __awaiter(this, void 0, void 0, function*() {
        if (Key.instance === undefined) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error("please call init function of refresh token key")
            );
        }
        return yield Key.instance.getKeyFromInstance();
    });
//# sourceMappingURL=refreshToken.js.map
