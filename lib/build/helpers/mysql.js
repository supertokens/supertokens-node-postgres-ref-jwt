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
const mysql = require("mysql");
const config_1 = require("../config");
const error_1 = require("../error");
const dbQueries_1 = require("./dbQueries");
/**
 * @description This is a singleton class since we need just one MySQL pool per node process.
 */
class Mysql {
    constructor(config) {
        this.pool = mysql.createPool({
            host: config.mysql.host,
            port: config.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database,
            connectionLimit: config.mysql.connectionLimit
        });
    }
    static init() {
        return __awaiter(this, void 0, void 0, function*() {
            if (Mysql.instance === undefined) {
                const config = config_1.default.get();
                Mysql.instance = new Mysql(config);
                yield createTablesIfNotExists();
            }
        });
    }
    static getConnection() {
        return new Promise((resolve, reject) => {
            if (Mysql.instance === undefined) {
                reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, new Error("mysql not initiated")));
                return;
            }
            Mysql.instance.pool.getConnection((err, connection) => {
                if (err) {
                    reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, err));
                    return;
                }
                resolve(connection);
            });
        });
    }
}
Mysql.reset = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    Mysql.instance = undefined;
};
exports.Mysql = Mysql;
function getConnection() {
    return __awaiter(this, void 0, void 0, function*() {
        try {
            const mysqlConnection = yield Mysql.getConnection();
            return new Connection(mysqlConnection);
        } catch (err) {
            throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
        }
    });
}
exports.getConnection = getConnection;
/**
 * @class Connection
 * @description class for one mysql connection to the DB. can be used for transactions, querying etc.. Please remember to close this connection in try {..} finally { close here. }.
 */
class Connection {
    constructor(mysqlConnection) {
        this.isClosed = false;
        this.destroyConnnection = false;
        this.currTransactionCount = 0; // used to keep track of live transactions. so that in case a connection is closed prematurely, we can destroy it.
        this.executeQuery = (query, params) => {
            return new Promise((resolve, reject) =>
                __awaiter(this, void 0, void 0, function*() {
                    this.mysqlConnection.query(query, params, (err, results, fields) => {
                        if (err) {
                            reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, err));
                            return;
                        }
                        resolve(results);
                    });
                })
            );
        };
        this.setDestroyConnection = () => {
            this.destroyConnnection = true;
        };
        this.throwIfTransactionIsNotStarted = message => {
            if (this.currTransactionCount === 0) {
                throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, new Error(message));
            }
        };
        this.startTransaction = () =>
            __awaiter(this, void 0, void 0, function*() {
                yield this.executeQuery("START TRANSACTION", []);
                this.currTransactionCount += 1;
            });
        this.commit = () =>
            __awaiter(this, void 0, void 0, function*() {
                yield this.executeQuery("COMMIT", []);
                this.currTransactionCount -= 1;
            });
        this.closeConnection = () => {
            if (this.isClosed) {
                return;
            }
            if (this.mysqlConnection === undefined) {
                throw Error("no connect to MySQL server.");
            }
            if (this.currTransactionCount > 0) {
                this.setDestroyConnection();
            }
            try {
                if (this.destroyConnnection) {
                    this.mysqlConnection.destroy();
                } else {
                    this.mysqlConnection.release();
                }
                this.isClosed = true;
            } catch (err) {
                // we intentially do not throw here.. but we log it.
                error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
            }
        };
        this.mysqlConnection = mysqlConnection;
    }
}
exports.Connection = Connection;
function createTablesIfNotExists() {
    return __awaiter(this, void 0, void 0, function*() {
        // first we check if the tables exist so that if the given mysql user does not have the privilege of creating them, then it won't throw an error.
        if ((yield checkIfSigningKeyTableExists()) && (yield checkIfRefreshTokensTableExists())) {
            return;
        }
        const config = config_1.default.get();
        let signingKeyTableName = config.mysql.tables.signingKey;
        let refreshTokensTableName = config.mysql.tables.refreshTokens;
        let connection = yield getConnection();
        try {
            yield dbQueries_1.createTablesIfNotExists(connection, signingKeyTableName, refreshTokensTableName);
        } finally {
            connection.closeConnection();
        }
    });
}
function checkIfSigningKeyTableExists() {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let signingKeyTableName = config.mysql.tables.signingKey;
        let connection = yield getConnection();
        try {
            yield dbQueries_1.checkIfTableExists(connection, signingKeyTableName);
            return true;
        } catch (err) {
            // i.e. tables don't exist
            return false;
        } finally {
            connection.closeConnection();
        }
    });
}
exports.checkIfSigningKeyTableExists = checkIfSigningKeyTableExists;
function checkIfRefreshTokensTableExists() {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let refreshTokensTableName = config.mysql.tables.refreshTokens;
        let connection = yield getConnection();
        try {
            yield dbQueries_1.checkIfTableExists(connection, refreshTokensTableName);
            return true;
        } catch (err) {
            // i.e. tables don't exist
            return false;
        } finally {
            connection.closeConnection();
        }
    });
}
exports.checkIfRefreshTokensTableExists = checkIfRefreshTokensTableExists;
//# sourceMappingURL=mysql.js.map
