import * as pg from "pg";
import { Pool } from "pg";

import Config from "../config";
import { AuthError, generateError } from "../error";
import { checkIfTableExists, createTablesIfNotExists as createTablesIfNotExistsQueries } from "./dbQueries";
import { PostgresParamTypes, TypeConfig } from "./types";

/**
 * @description This is a singleton class since we need just one MySQL pool per node process.
 */
export class Postgres {
    private static instance: undefined | Postgres;
    private pool: pg.Pool;

    private constructor(config: TypeConfig, clientPool?: pg.Pool) {
        if (clientPool !== undefined) {
            this.pool = clientPool;
            return;
        }
        this.pool = new Pool({
            host: config.postgres.host,
            port: config.postgres.port,
            user: config.postgres.user,
            password: config.postgres.password,
            database: config.postgres.database
        });
        this.pool.on("error", (err, client) => {
            // we should log this event.
            generateError(AuthError.GENERAL_ERROR, err);
        });
    }

    static async init(clientPool?: pg.Pool) {
        if (Postgres.instance === undefined) {
            const config = Config.get();
            Postgres.instance = new Postgres(config, clientPool);
            await createTablesIfNotExists();
        }
    }

    static getConnection(): Promise<pg.PoolClient> {
        return new Promise<pg.PoolClient>((resolve, reject) => {
            if (Postgres.instance === undefined) {
                reject(generateError(AuthError.GENERAL_ERROR, new Error("postgres not initiated")));
                return;
            }
            Postgres.instance.pool.connect((err, connection) => {
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
        Postgres.instance = undefined;
    };
}

export async function getConnection(): Promise<Connection> {
    try {
        const postgresConnection = await Postgres.getConnection();
        return new Connection(postgresConnection);
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
    private postgresConnection: pg.PoolClient;
    private currTransactionCount = 0; // used to keep track of live transactions. so that in case a connection is closed prematurely, we can destroy it.

    constructor(postgresConnection: pg.PoolClient) {
        this.postgresConnection = postgresConnection;
    }

    executeQuery = (query: string, params: PostgresParamTypes[]): Promise<any> => {
        return new Promise<any>(async (resolve, reject) => {
            this.postgresConnection.query(query, params, (err, result) => {
                if (err) {
                    reject(generateError(AuthError.GENERAL_ERROR, err));
                    return;
                }
                resolve(result);
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
        try {
            if (this.isClosed) {
                return;
            }
            if (this.postgresConnection === undefined) {
                throw Error("no connect to MySQL server.");
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
    let signingKeyTableName = config.postgres.tables.signingKey;
    let refreshTokensTableName = config.postgres.tables.refreshTokens;
    let connection = await getConnection();
    try {
        await createTablesIfNotExistsQueries(connection, signingKeyTableName, refreshTokensTableName);
    } finally {
        connection.closeConnection();
    }
}

export async function checkIfSigningKeyTableExists(): Promise<boolean> {
    const config = Config.get();
    let signingKeyTableName = config.postgres.tables.signingKey;
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
    let refreshTokensTableName = config.postgres.tables.refreshTokens;
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
