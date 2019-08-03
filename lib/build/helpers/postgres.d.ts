import * as pg from "pg";
import { PostgresParamTypes } from "./types";
/**
 * @description This is a singleton class since we need just one MySQL pool per node process.
 */
export declare class Postgres {
    private static instance;
    private pool;
    private constructor();
    static init(clientPool?: pg.Pool): Promise<void>;
    static getConnection(): Promise<pg.PoolClient>;
    static reset: () => void;
}
export declare function getConnection(): Promise<Connection>;
/**
 * @class Connection
 * @description class for one mysql connection to the DB. can be used for transactions, querying etc.. Please remember to close this connection in try {..} finally { close here. }.
 */
export declare class Connection {
    private isClosed;
    private destroyConnnection;
    private postgresConnection;
    private currTransactionCount;
    constructor(postgresConnection: pg.PoolClient);
    executeQuery: (query: string, params: PostgresParamTypes[]) => Promise<any>;
    private setDestroyConnection;
    throwIfTransactionIsNotStarted: (message: string) => void;
    startTransaction: () => Promise<void>;
    commit: () => Promise<void>;
    closeConnection: () => void;
}
export declare function checkIfSigningKeyTableExists(): Promise<boolean>;
export declare function checkIfRefreshTokensTableExists(): Promise<boolean>;
