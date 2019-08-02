"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const utils_1 = require("./helpers/utils");
/**
 * @class Config
 * @description this is a singleton class since we need just one Config for this node process.
 */
class Config {
    constructor(config) {
        this.config = config;
    }
    /**
     * @description called when library is being initialised
     * @throws AuthError GENERAL_ERROR
     */
    static init(config) {
        if (Config.instance === undefined) {
            Config.instance = new Config(setDefaults(validateAndNormalise(config)));
        }
    }
    static get() {
        if (Config.instance === undefined) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error("configs not set. Please call the init function before using this library"),
                false
            );
        }
        return Config.instance.config;
    }
}
Config.reset = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    Config.instance = undefined;
};
Config.isInitialised = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    return Config.instance !== undefined;
};
exports.default = Config;
/**
 * @description checks for user input validity in terms of types and ranges
 * @throws AuthError GENERAL_ERROR
 */
const validateAndNormalise = config => {
    if (config === null || typeof config !== "object") {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("passed config is not an object"),
            false
        );
    }
    const mysqlInputConfig = config.mysql;
    if (typeof mysqlInputConfig !== "object") {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("mysql config not passed. user, password and database are required"),
            false
        );
    }
    const host = utils_1.sanitizeStringInput(mysqlInputConfig.host);
    const port = utils_1.sanitizeNumberInput(mysqlInputConfig.port);
    const user = utils_1.sanitizeStringInput(mysqlInputConfig.user);
    if (user === undefined) {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("mysql config error. user not passed"),
            false
        );
    }
    const password = utils_1.sanitizeStringInput(mysqlInputConfig.password);
    if (password === undefined) {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("mysql config error. password not passed"),
            false
        );
    }
    const connectionLimit = utils_1.sanitizeNumberInput(mysqlInputConfig.connectionLimit);
    const database = utils_1.sanitizeStringInput(mysqlInputConfig.database);
    if (database === undefined) {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("mysql config error. database not passed"),
            false
        );
    }
    let tables;
    const tablesMysqlInputConfig = mysqlInputConfig.tables;
    if (tablesMysqlInputConfig !== undefined) {
        const signingKey = utils_1.sanitizeStringInput(tablesMysqlInputConfig.signingKey);
        const refreshTokens = utils_1.sanitizeStringInput(tablesMysqlInputConfig.refreshTokens);
        tables = {
            signingKey,
            refreshTokens
        };
    }
    const mysql = {
        host,
        port,
        user,
        password,
        connectionLimit,
        database,
        tables
    };
    let tokensInputConfig = config.tokens;
    const accessTokenInputConfig = tokensInputConfig.accessToken;
    let accessToken;
    if (accessTokenInputConfig !== undefined) {
        const signingKeyInputConfig = accessTokenInputConfig.signingKey;
        let signingKey;
        if (signingKeyInputConfig !== undefined) {
            const dynamic = utils_1.sanitizeBooleanInput(signingKeyInputConfig.dynamic);
            let updateInterval = utils_1.sanitizeNumberInput(signingKeyInputConfig.updateInterval);
            if (updateInterval !== undefined && process.env.TEST_MODE !== "testing") {
                if (updateInterval > defaultConfig.tokens.accessToken.signingKey.updateInterval.max) {
                    throw error_1.generateError(
                        error_1.AuthError.GENERAL_ERROR,
                        new Error(
                            "update interval passed for updating singingKey for access token is not within allowed interval. (Note: value passed will be in units of hours)"
                        ),
                        false
                    );
                } else if (updateInterval < defaultConfig.tokens.accessToken.signingKey.updateInterval.min) {
                    throw error_1.generateError(
                        error_1.AuthError.GENERAL_ERROR,
                        new Error(
                            "update interval passed for updating singingKey for access token is not within allowed interval. (Note: value passed will be in units of hours)"
                        ),
                        false
                    );
                }
            }
            const get = signingKeyInputConfig.get;
            if (get !== undefined && typeof get !== "function") {
                throw error_1.generateError(
                    error_1.AuthError.GENERAL_ERROR,
                    new Error("config > tokens > accessToken > get must be a function"),
                    false
                );
            }
            signingKey = {
                dynamic,
                updateInterval,
                get
            };
        }
        let validity = utils_1.sanitizeNumberInput(accessTokenInputConfig.validity);
        if (validity !== undefined && process.env.TEST_MODE !== "testing") {
            if (validity > defaultConfig.tokens.accessToken.validity.max) {
                throw error_1.generateError(
                    error_1.AuthError.GENERAL_ERROR,
                    new Error(
                        "passed value for validity of access token is not within allowed interval. (Note: value passed will be in units of seconds)"
                    ),
                    false
                );
            } else if (validity < defaultConfig.tokens.accessToken.validity.min) {
                throw error_1.generateError(
                    error_1.AuthError.GENERAL_ERROR,
                    new Error(
                        "passed value for validity of access token is not within allowed interval. (Note: value passed will be in units of seconds)"
                    ),
                    false
                );
            }
        }
        let blacklisting = utils_1.sanitizeBooleanInput(accessTokenInputConfig.blacklisting);
        let accessTokenPath = utils_1.sanitizeStringInput(accessTokenInputConfig.accessTokenPath);
        accessToken = {
            signingKey,
            validity,
            blacklisting,
            accessTokenPath
        };
    }
    let enableAntiCsrf = utils_1.sanitizeBooleanInput(tokensInputConfig.enableAntiCsrf);
    let refreshTokenInputConfig = tokensInputConfig.refreshToken;
    if (typeof refreshTokenInputConfig !== "object") {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("refreshToken config not passed. renewTokenPath is required"),
            false
        );
    }
    let validity = utils_1.sanitizeNumberInput(refreshTokenInputConfig.validity);
    if (validity !== undefined && process.env.TEST_MODE !== "testing") {
        if (validity > defaultConfig.tokens.refreshToken.validity.max) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error(
                    "passed value for validity of refresh token is not within allowed interval. (Note: value passed will be in units of hours)"
                ),
                false
            );
        } else if (validity < defaultConfig.tokens.refreshToken.validity.min) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error(
                    "passed value for validity of refresh token is not within allowed interval. (Note: value passed will be in units of hours)"
                ),
                false
            );
        }
    }
    const renewTokenPath = utils_1.sanitizeStringInput(refreshTokenInputConfig.renewTokenPath);
    if (renewTokenPath === undefined) {
        throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, new Error("renewTokenPath not passed"), false);
    }
    const removalCronjobInterval = utils_1.sanitizeStringInput(refreshTokenInputConfig.removalCronjobInterval);
    if (removalCronjobInterval !== undefined && typeof removalCronjobInterval !== "string") {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("removalCronjobInterval does not have the correct type"),
            false
        );
    }
    const refreshToken = {
        renewTokenPath,
        removalCronjobInterval,
        validity
    };
    const tokens = {
        accessToken,
        refreshToken,
        enableAntiCsrf
    };
    let loggingInputConfig = config.logging;
    let logging;
    if (loggingInputConfig !== undefined) {
        let info = loggingInputConfig.info;
        let error = loggingInputConfig.error;
        if (info !== undefined && typeof info !== "function") {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error("logging config error. info option passed must be a function"),
                false
            );
        }
        if (error !== undefined && typeof error !== "function") {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                new Error("logging config error. error option passed must be a function"),
                false
            );
        }
        logging = {
            info,
            error
        };
    }
    const cookieInputConfig = config.cookie;
    const domain = utils_1.sanitizeStringInput(cookieInputConfig.domain);
    const secure = utils_1.sanitizeBooleanInput(cookieInputConfig.secure);
    if (domain === undefined) {
        throw error_1.generateError(
            error_1.AuthError.GENERAL_ERROR,
            new Error("domain parameter for cookie not passed"),
            false
        );
    }
    const cookie = {
        domain,
        secure
    };
    return {
        mysql,
        tokens,
        cookie,
        logging
    };
};
const setDefaults = config => {
    // TODO: change this style of a || b to a === undefined ? b : a
    return {
        mysql: {
            host: config.mysql.host || defaultConfig.mysql.host,
            port: config.mysql.port || defaultConfig.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            connectionLimit: config.mysql.connectionLimit || defaultConfig.mysql.connectionLimit,
            database: config.mysql.database,
            tables:
                config.mysql.tables === undefined
                    ? defaultConfig.mysql.tables
                    : {
                          refreshTokens: config.mysql.tables.refreshTokens || defaultConfig.mysql.tables.refreshTokens,
                          signingKey: config.mysql.tables.signingKey || defaultConfig.mysql.tables.signingKey
                      }
        },
        tokens: {
            accessToken:
                config.tokens.accessToken === undefined
                    ? {
                          signingKey: {
                              dynamic: defaultConfig.tokens.accessToken.signingKey.dynamic,
                              updateInterval:
                                  defaultConfig.tokens.accessToken.signingKey.updateInterval.default * 60 * 60 * 1000,
                              get: undefined
                          },
                          validity: defaultConfig.tokens.accessToken.validity.default * 1000,
                          blacklisting: defaultConfig.tokens.accessToken.blacklisting,
                          accessTokenPath: defaultConfig.tokens.accessToken.accessTokenPath
                      }
                    : {
                          signingKey:
                              config.tokens.accessToken.signingKey === undefined
                                  ? {
                                        dynamic: defaultConfig.tokens.accessToken.signingKey.dynamic,
                                        updateInterval:
                                            defaultConfig.tokens.accessToken.signingKey.updateInterval.default *
                                            60 *
                                            60 *
                                            1000,
                                        get: undefined
                                    }
                                  : {
                                        dynamic:
                                            config.tokens.accessToken.signingKey.dynamic === undefined
                                                ? defaultConfig.tokens.accessToken.signingKey.dynamic
                                                : config.tokens.accessToken.signingKey.dynamic,
                                        updateInterval:
                                            (config.tokens.accessToken.signingKey.updateInterval ||
                                                defaultConfig.tokens.accessToken.signingKey.updateInterval.default) *
                                            60 *
                                            60 *
                                            1000,
                                        get: config.tokens.accessToken.signingKey.get
                                    },
                          validity:
                              (config.tokens.accessToken.validity ||
                                  defaultConfig.tokens.accessToken.validity.default) * 1000,
                          blacklisting:
                              config.tokens.accessToken.blacklisting === undefined
                                  ? defaultConfig.tokens.accessToken.blacklisting
                                  : config.tokens.accessToken.blacklisting,
                          accessTokenPath:
                              config.tokens.accessToken.accessTokenPath === undefined
                                  ? defaultConfig.tokens.accessToken.accessTokenPath
                                  : config.tokens.accessToken.accessTokenPath
                      },
            refreshToken: {
                validity:
                    (config.tokens.refreshToken.validity || defaultConfig.tokens.refreshToken.validity.default) *
                    60 *
                    60 *
                    1000,
                removalCronjobInterval:
                    config.tokens.refreshToken.removalCronjobInterval === undefined
                        ? defaultConfig.tokens.refreshToken.removalCronjobInterval
                        : config.tokens.refreshToken.removalCronjobInterval,
                renewTokenPath: config.tokens.refreshToken.renewTokenPath
            },
            enableAntiCsrf:
                config.tokens.enableAntiCsrf === undefined
                    ? defaultConfig.tokens.enableAntiCsrf
                    : config.tokens.enableAntiCsrf
        },
        cookie: {
            secure: config.cookie.secure === undefined ? defaultConfig.cookie.secure : config.cookie.secure,
            domain: config.cookie.domain
        },
        logging: {
            info: config.logging !== undefined ? config.logging.info : undefined,
            error: config.logging !== undefined ? config.logging.error : undefined
        }
    };
};
const defaultConfig = {
    mysql: {
        host: "localhost",
        port: 3306,
        connectionLimit: 50,
        tables: {
            signingKey: "signing_key",
            refreshTokens: "refresh_token"
        }
    },
    tokens: {
        accessToken: {
            signingKey: {
                dynamic: true,
                updateInterval: {
                    // in hours.
                    min: 1,
                    max: 720,
                    default: 24
                }
            },
            validity: {
                // in seconds
                min: 10,
                max: 1000 * 24 * 3600,
                default: 3600
            },
            blacklisting: false,
            accessTokenPath: "/"
        },
        enableAntiCsrf: true,
        refreshToken: {
            validity: {
                // in hours.
                min: 1,
                max: 365 * 24,
                default: 100 * 24
            },
            removalCronjobInterval: "0 0 0 1-31/7 * *" // every 7th day of a month starting from the 1st until the 31st
        }
    },
    cookie: {
        secure: true
    }
};
//# sourceMappingURL=config.js.map
