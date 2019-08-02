import Config from "../config";
import { AuthError, generateError } from "../error";
import { Connection, getConnection } from "./mysql";
import { parseUserIdToCorrectFormat, stringifyUserId } from "./utils";

/**
 * @description contains all the mysql queries.
 * @throws AuthError GENERAL_ERROR
 */

/**
 * @param connection
 * @param tableName
 * @throws error if the tables don't exist.
 */
export async function checkIfTableExists(connection: Connection, tableName: string): Promise<void> {
    const query = `SELECT 1 FROM ${tableName} LIMIT 1`;
    await connection.executeQuery(query, []);
}

/**
 * @param connection
 * @param signingKeyTableName
 * @param refreshTokensTableName
 */
export async function createTablesIfNotExists(
    connection: Connection,
    signingKeyTableName: string,
    refreshTokensTableName: string
) {
    const signKeyTableQuery = `
            CREATE TABLE IF NOT EXISTS ${signingKeyTableName} (
                key_name VARCHAR(128),
                key_value VARCHAR(255),
                created_at_time BIGINT UNSIGNED,
                PRIMARY KEY(key_name)
            );
        `;
    const refreshTokensTableQuery = `
            CREATE TABLE IF NOT EXISTS ${refreshTokensTableName} (
                session_handle VARCHAR(255) NOT NULL,
                user_id VARCHAR(128) NOT NULL,
                refresh_token_hash_2 VARCHAR(128) NOT NULL,
                session_info TEXT,
                expires_at BIGINT UNSIGNED NOT NULL,
                jwt_user_payload TEXT,
                PRIMARY KEY(session_handle)
            );
        `;
    const signKeyTableQueryPromise = connection.executeQuery(signKeyTableQuery, []);
    const refreshTokensTableQueryPromise = connection.executeQuery(refreshTokensTableQuery, []);
    await signKeyTableQueryPromise;
    await refreshTokensTableQueryPromise;
}

export async function getKeyValueFromKeyName_Transaction(
    connection: Connection,
    keyName: string
): Promise<{ keyValue: string; createdAtTime: number } | undefined> {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading signing keys");
    let query = `SELECT key_value, created_at_time FROM ${
        config.mysql.tables.signingKey
    } WHERE key_name = ? FOR UPDATE`;
    let result = await connection.executeQuery(query, [keyName]);
    if (result.length === 0) {
        return undefined;
    }
    return {
        keyValue: result[0].key_value.toString(),
        createdAtTime: Number(result[0].created_at_time)
    };
}

export async function insertKeyValueForKeyName_Transaction(
    connection: Connection,
    keyName: string,
    keyValue: string,
    createdAtTime: number
) {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading signing keys");
    let query = `INSERT INTO ${
        config.mysql.tables.signingKey
    }(key_name, key_value, created_at_time) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE key_value = ?, created_at_time = ?`;
    await connection.executeQuery(query, [keyName, keyValue, createdAtTime, keyValue, createdAtTime]);
}

export async function updateSessionData(connection: Connection, sessionHandle: string, sessionData: any) {
    const config = Config.get();
    let query = `UPDATE ${config.mysql.tables.refreshTokens} SET session_info = ? WHERE session_handle = ?`;
    let result = await connection.executeQuery(query, [serialiseSessionData(sessionData), sessionHandle]);
    return result.affectedRows;
}

export async function getSessionData(
    connection: Connection,
    sessionHandle: string
): Promise<{ found: false } | { found: true; data: any }> {
    const config = Config.get();
    let query = `SELECT session_info FROM ${config.mysql.tables.refreshTokens} WHERE session_handle = ?`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    if (result.length === 0) {
        return {
            found: false
        };
    }
    return {
        found: true,
        data: unserialiseSessionData(result[0].session_info)
    };
}

export async function deleteSession(connection: Connection, sessionHandle: string): Promise<number> {
    const config = Config.get();
    let query = `DELETE FROM ${config.mysql.tables.refreshTokens} WHERE session_handle = ?`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    return result.affectedRows;
}

export async function createNewSession(
    connection: Connection,
    sessionHandle: string,
    userId: string | number,
    refreshTokenHash2: string,
    sessionData: any,
    expiresAt: number,
    jwtPayload: any
) {
    userId = stringifyUserId(userId);
    const config = Config.get();
    let query = `INSERT INTO ${config.mysql.tables.refreshTokens} 
    (session_handle, user_id, refresh_token_hash_2,
    session_info, expires_at, jwt_user_payload) VALUES (?, ?, ?, ?, ?, ?)`;
    await connection.executeQuery(query, [
        sessionHandle,
        userId,
        refreshTokenHash2,
        serialiseSessionData(sessionData),
        expiresAt,
        serialiseSessionData(jwtPayload)
    ]);
}

export async function isSessionBlacklisted(connection: Connection, sessionHandle: string): Promise<boolean> {
    const config = Config.get();
    let query = `SELECT session_handle FROM ${config.mysql.tables.refreshTokens} WHERE session_handle = ?`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    return result.length === 0;
}

export async function getSessionInfo_Transaction(
    connection: Connection,
    sessionHandle: string
): Promise<
    | {
          userId: string | number;
          refreshTokenHash2: string;
          sessionData: any;
          expiresAt: number;
          jwtPayload: any;
      }
    | undefined
> {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading session data");
    let query = `SELECT user_id,
    refresh_token_hash_2, session_info,
    expires_at, jwt_user_payload FROM ${config.mysql.tables.refreshTokens} WHERE session_handle = ? FOR UPDATE`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    if (result.length === 0) {
        return undefined;
    }
    let row = result[0];
    return {
        userId: parseUserIdToCorrectFormat(row.user_id),
        refreshTokenHash2: row.refresh_token_hash_2,
        sessionData: unserialiseSessionData(row.session_info),
        expiresAt: Number(row.expires_at),
        jwtPayload: unserialiseSessionData(row.jwt_user_payload)
    };
}

export async function updateSessionInfo_Transaction(
    connection: Connection,
    sessionHandle: string,
    refreshTokenHash2: string,
    sessionData: any,
    expiresAt: number
): Promise<number> {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when updating session data");
    let query = `UPDATE ${config.mysql.tables.refreshTokens} SET refresh_token_hash_2 = ?, 
    session_info = ?, expires_at = ? WHERE session_handle = ?`;
    let result = await connection.executeQuery(query, [
        refreshTokenHash2,
        serialiseSessionData(sessionData),
        expiresAt,
        sessionHandle
    ]);
    return result.affectedRows;
}

export async function getAllSessionHandlesForUser(connection: Connection, userId: string | number): Promise<string[]> {
    userId = stringifyUserId(userId);
    const config = Config.get();
    let query = `SELECT session_handle FROM ${config.mysql.tables.refreshTokens} WHERE user_id = ?`;
    let result = await connection.executeQuery(query, [userId]);
    return result.map((i: any) => i.session_handle.toString());
}

export async function deleteAllExpiredSessions(connection: Connection) {
    const config = Config.get();
    const query = `DELETE FROM ${config.mysql.tables.refreshTokens} WHERE expires_at <= ?;`;
    await connection.executeQuery(query, [Date.now()]);
}

function serialiseSessionData(data: any): string {
    if (data === undefined) {
        return "";
    } else {
        return JSON.stringify(data);
    }
}

function unserialiseSessionData(data: string): any {
    if (data === "") {
        return undefined;
    } else {
        try {
            return JSON.parse(data);
        } catch (err) {
            throw generateError(AuthError.GENERAL_ERROR, err);
        }
    }
}

export async function resetTables(connection: Connection) {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    const config = Config.get();
    let query = `DROP TABLE IF EXISTS ${config.mysql.tables.refreshTokens}, ${config.mysql.tables.signingKey};`;
    await connection.executeQuery(query, []);
}

export async function getNumberOfRowsInRefreshTokensTable(): Promise<number> {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    let connection = await getConnection();
    try {
        const config = Config.get();
        let query = `SELECT COUNT(*) AS rowsCount FROM ${config.mysql.tables.refreshTokens};`;
        let result = await connection.executeQuery(query, []);
        return Number(result[0].rowsCount);
    } finally {
        connection.closeConnection();
    }
}
