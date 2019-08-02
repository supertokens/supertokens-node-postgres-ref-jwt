import * as mysql from "mysql";

import Config from "../config";
import { AuthError, generateError } from "../error";
import { checkIfTableExists, createTablesIfNotExists as createTablesIfNotExistsQueries } from "./dbQueries";
import { MySQLParamTypes, TypeConfig } from "./types";

/**
 * @description This is a singleton class since we need just one MySQL pool per node process.
 */
export class Mysql {
    private static instance: undefined | Mysql;
    private pool: mysql.Pool;

    private constructor(config: TypeConfig) {
        this.pool = mysql.createPool({
            host: config.mysql.host,
            port: config.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database,
            connectionLimit: config.mysql.connectionLimit
        });
    }

    static async init() {
        if (Mysql.instance === undefined) {
            const config = Config.get();
            Mysql.instance = new Mysql(config);
            await createTablesIfNotExists();
        }
    }

    static getConnection(): Promise<mysql.PoolConnection> {
        return new Promise<mysql.PoolConnection>((resolve, reject) => {
            if (Mysql.instance === undefined) {
                reject(generateError(AuthError.GENERAL_ERROR, new Error("mysql not initiated")));
                return;
            }
            Mysql.instance.pool.getConnection((err, connection) => {
                if (err) {
                    reject(generateError(AuthError.GENERAL_ERROR, err));
                    return;
                }
                resolve(connection);
            });
        });
    }

    static reset = () => {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        Mysql.instance = undefined;
    };
}

export async function getConnection(): Promise<Connection> {
    try {
        const mysqlConnection = await Mysql.getConnection();
        return new Connection(mysqlConnection);
    } catch (err) {
        throw generateError(AuthError.GENERAL_ERROR, err);
    }
}

/**
 * @class Connection
 * @description class for one mysql connection to the DB. can be used for transactions, querying etc.. Please remember to close this connection in try {..} finally { close here. }.
 */
export class Connection {
    private isClosed = false;
    private destroyConnnection = false;
    private mysqlConnection: mysql.PoolConnection;
    private currTransactionCount = 0; // used to keep track of live transactions. so that in case a connection is closed prematurely, we can destroy it.

    constructor(mysqlConnection: mysql.PoolConnection) {
        this.mysqlConnection = mysqlConnection;
    }

    executeQuery = (query: string, params: MySQLParamTypes[]): Promise<any> => {
        return new Promise<any>(async (resolve, reject) => {
            this.mysqlConnection.query(query, params, (err, results, fields) => {
                if (err) {
                    reject(generateError(AuthError.GENERAL_ERROR, err));
                    return;
                }
                resolve(results);
            });
        });
    };

    private setDestroyConnection = () => {
        this.destroyConnnection = true;
    };

    throwIfTransactionIsNotStarted = (message: string) => {
        if (this.currTransactionCount === 0) {
            throw generateError(AuthError.GENERAL_ERROR, new Error(message));
        }
    };

    startTransaction = async () => {
        await this.executeQuery("START TRANSACTION", []);
        this.currTransactionCount += 1;
    };

    commit = async () => {
        await this.executeQuery("COMMIT", []);
        this.currTransactionCount -= 1;
    };

    closeConnection = () => {
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
            generateError(AuthError.GENERAL_ERROR, err);
        }
    };
}

async function createTablesIfNotExists() {
    // first we check if the tables exist so that if the given mysql user does not have the privilege of creating them, then it won't throw an error.
    if ((await checkIfSigningKeyTableExists()) && (await checkIfRefreshTokensTableExists())) {
        return;
    }
    const config = Config.get();
    let signingKeyTableName = config.mysql.tables.signingKey;
    let refreshTokensTableName = config.mysql.tables.refreshTokens;
    let connection = await getConnection();
    try {
        await createTablesIfNotExistsQueries(connection, signingKeyTableName, refreshTokensTableName);
    } finally {
        connection.closeConnection();
    }
}

export async function checkIfSigningKeyTableExists(): Promise<boolean> {
    const config = Config.get();
    let signingKeyTableName = config.mysql.tables.signingKey;
    let connection = await getConnection();
    try {
        await checkIfTableExists(connection, signingKeyTableName);
        return true;
    } catch (err) {
        // i.e. tables don't exist
        return false;
    } finally {
        connection.closeConnection();
    }
}

export async function checkIfRefreshTokensTableExists(): Promise<boolean> {
    const config = Config.get();
    let refreshTokensTableName = config.mysql.tables.refreshTokens;
    let connection = await getConnection();
    try {
        await checkIfTableExists(connection, refreshTokensTableName);
        return true;
    } catch (err) {
        // i.e. tables don't exist
        return false;
    } finally {
        connection.closeConnection();
    }
}
