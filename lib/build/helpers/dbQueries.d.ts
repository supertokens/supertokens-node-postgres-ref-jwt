import { Connection } from "./postgres";
/**
 * @description contains all the postgres queries.
 * @throws AuthError GENERAL_ERROR
 */
/**
 * @param connection
 * @param tableName
 * @throws error if the tables don't exist.
 */
export declare function checkIfTableExists(connection: Connection, tableName: string): Promise<void>;
/**
 * @param connection
 * @param signingKeyTableName
 * @param refreshTokensTableName
 */
export declare function createTablesIfNotExists(connection: Connection, signingKeyTableName: string, refreshTokensTableName: string): Promise<void>;
export declare function getKeyValueFromKeyName_Transaction(connection: Connection, keyName: string): Promise<{
    keyValue: string;
    createdAtTime: number;
} | undefined>;
export declare function insertKeyValueForKeyName_Transaction(connection: Connection, keyName: string, keyValue: string, createdAtTime: number): Promise<void>;
export declare function updateSessionInfo(connection: Connection, sessionHandle: string, sessionInfo: any): Promise<any>;
export declare function getSessionInfo(connection: Connection, sessionHandle: string): Promise<{
    found: false;
} | {
    found: true;
    data: any;
}>;
export declare function deleteSession(connection: Connection, sessionHandle: string): Promise<number>;
export declare function createNewSession(connection: Connection, sessionHandle: string, userId: string | number, refreshTokenHash2: string, sessionInfo: any, expiresAt: number, jwtPayload: any): Promise<void>;
export declare function isSessionBlacklisted(connection: Connection, sessionHandle: string): Promise<boolean>;
export declare function getSessionObject_Transaction(connection: Connection, sessionHandle: string): Promise<{
    userId: string | number;
    refreshTokenHash2: string;
    sessionInfo: any;
    expiresAt: number;
    jwtPayload: any;
} | undefined>;
export declare function updateSessionObject_Transaction(connection: Connection, sessionHandle: string, refreshTokenHash2: string, sessionInfo: any, expiresAt: number): Promise<number>;
export declare function getAllSessionHandlesForUser(connection: Connection, userId: string | number): Promise<string[]>;
export declare function deleteAllExpiredSessions(connection: Connection): Promise<void>;
export declare function resetTables(connection: Connection): Promise<void>;
export declare function getNumberOfRowsInRefreshTokensTable(): Promise<number>;
