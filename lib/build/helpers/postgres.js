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
const pg_1 = require("pg");
const config_1 = require("../config");
const error_1 = require("../error");
const dbQueries_1 = require("./dbQueries");
/**
 * @description This is a singleton class since we need just one Postgres pool per node process.
 */
class Postgres {
    constructor(config, clientPool) {
        if (clientPool !== undefined) {
            this.pool = clientPool;
            return;
        }
        this.pool = new pg_1.Pool(config.postgres.config);
        this.pool.on("error", err => {
            // we should log this event.
            error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
        });
    }
    static init(clientPool) {
        return __awaiter(this, void 0, void 0, function*() {
            if (Postgres.instance === undefined) {
                const config = config_1.default.get();
                Postgres.instance = new Postgres(config, clientPool);
                yield createTablesIfNotExists();
            }
        });
    }
    static getConnection() {
        return new Promise((resolve, reject) => {
            if (Postgres.instance === undefined) {
                reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, new Error("postgres not initiated")));
                return;
            }
            Postgres.instance.pool.connect((err, connection) => {
                if (err) {
                    reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, err));
                    return;
                }
                resolve(connection);
            });
        });
    }
}
Postgres.reset = () => {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    Postgres.instance = undefined;
};
exports.Postgres = Postgres;
function getConnection() {
    return __awaiter(this, void 0, void 0, function*() {
        try {
            const postgresConnection = yield Postgres.getConnection();
            return new Connection(postgresConnection);
        } catch (err) {
            throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
        }
    });
}
exports.getConnection = getConnection;
/**
 * @class Connection
 * @description class for one Postgres connection to the DB. can be used for transactions, querying etc.. Please remember to close this connection in try {..} finally { close here. }.
 */
class Connection {
    constructor(postgresConnection) {
        this.isClosed = false;
        this.destroyConnnection = false;
        this.currTransactionCount = 0; // used to keep track of live transactions. so that in case a connection is closed prematurely, we can destroy it.
        this.executeQuery = (query, params) => {
            return new Promise((resolve, reject) =>
                __awaiter(this, void 0, void 0, function*() {
                    this.postgresConnection.query(query, params, (err, result) => {
                        if (err) {
                            reject(error_1.generateError(error_1.AuthError.GENERAL_ERROR, err));
                            return;
                        }
                        resolve(result.rows);
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
            try {
                if (this.isClosed) {
                    return;
                }
                if (this.postgresConnection === undefined) {
                    throw Error("no connect to Postgres server.");
                }
                if (this.currTransactionCount > 0) {
                    this.setDestroyConnection();
                }
                if (this.destroyConnnection) {
                    // passing an error also causes the client to disconnect this client
                    this.postgresConnection.release(new Error("exiting client without ending transaction"));
                } else {
                    this.postgresConnection.release();
                }
                this.isClosed = true;
            } catch (err) {
                // we intentially do not throw here.. but we log it.
                error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
            }
        };
        this.postgresConnection = postgresConnection;
    }
}
exports.Connection = Connection;
function createTablesIfNotExists() {
    return __awaiter(this, void 0, void 0, function*() {
        // first we check if the tables exist so that if the given Postgres user does not have the privilege of creating them, then it won't throw an error.
        if ((yield checkIfSigningKeyTableExists()) && (yield checkIfRefreshTokensTableExists())) {
            return;
        }
        const config = config_1.default.get();
        let signingKeyTableName = config.postgres.tables.signingKey;
        let refreshTokensTableName = config.postgres.tables.refreshTokens;
        let connection = yield getConnection();
        try {
            // we intentionally fo not catch err because it should propagate to client's init function
            yield dbQueries_1.createTablesIfNotExists(connection, signingKeyTableName, refreshTokensTableName);
        } finally {
            connection.closeConnection();
        }
    });
}
function checkIfSigningKeyTableExists() {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let signingKeyTableName = config.postgres.tables.signingKey;
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
        let refreshTokensTableName = config.postgres.tables.refreshTokens;
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
//# sourceMappingURL=postgres.js.map
