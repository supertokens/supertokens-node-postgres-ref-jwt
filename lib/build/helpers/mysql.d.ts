import * as mysql from "mysql";
import { MySQLParamTypes } from "./types";
/**
 * @description This is a singleton class since we need just one MySQL pool per node process.
 */
export declare class Mysql {
    private static instance;
    private pool;
    private constructor();
    static init(): Promise<void>;
    static getConnection(): Promise<mysql.PoolConnection>;
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
    private mysqlConnection;
    private currTransactionCount;
    constructor(mysqlConnection: mysql.PoolConnection);
    executeQuery: (query: string, params: MySQLParamTypes[]) => Promise<any>;
    private setDestroyConnection;
    throwIfTransactionIsNotStarted: (message: string) => void;
    startTransaction: () => Promise<void>;
    commit: () => Promise<void>;
    closeConnection: () => void;
}
export declare function checkIfSigningKeyTableExists(): Promise<boolean>;
export declare function checkIfRefreshTokensTableExists(): Promise<boolean>;
