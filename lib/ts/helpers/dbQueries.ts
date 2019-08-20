import Config from "../config";
import { AuthError, generateError } from "../error";
import { Connection, getConnection } from "./postgres";
import { parseUserIdToCorrectFormat, stringifyUserId } from "./utils";

/**
 * @description contains all the postgres queries.
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
                created_at_time BIGINT,
                PRIMARY KEY(key_name)
            );
        `;
    const refreshTokensTableQuery = `
            CREATE TABLE IF NOT EXISTS ${refreshTokensTableName} (
                session_handle VARCHAR(255) NOT NULL,
                user_id VARCHAR(128) NOT NULL,
                refresh_token_hash_2 VARCHAR(128) NOT NULL,
                session_info TEXT,
                expires_at BIGINT,
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
        config.postgres.tables.signingKey
    } WHERE key_name = $1 FOR UPDATE`;
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
        config.postgres.tables.signingKey
    }(key_name, key_value, created_at_time) VALUES ($1, $2, $3) ON CONFLICT (key_name) DO UPDATE SET key_value = $4, created_at_time = $5`;
    await connection.executeQuery(query, [keyName, keyValue, createdAtTime, keyValue, createdAtTime]);
}

export async function updateSessionInfo(connection: Connection, sessionHandle: string, sessionInfo: any) {
    const config = Config.get();
    let query = `UPDATE ${
        config.postgres.tables.refreshTokens
    } SET session_info = $1 WHERE session_handle = $2 RETURNING *`;
    let result = await connection.executeQuery(query, [serialiseSessionInfo(sessionInfo), sessionHandle]);
    return result.length;
}

export async function getSessionInfo(
    connection: Connection,
    sessionHandle: string
): Promise<{ found: false } | { found: true; data: any }> {
    const config = Config.get();
    let query = `SELECT session_info FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    if (result.length === 0) {
        return {
            found: false
        };
    }
    return {
        found: true,
        data: unserialiseSessionInfo(result[0].session_info)
    };
}

export async function deleteSession(connection: Connection, sessionHandle: string): Promise<number> {
    const config = Config.get();
    let query = `DELETE FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1 RETURNING *`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    return result.length;
}

export async function createNewSession(
    connection: Connection,
    sessionHandle: string,
    userId: string | number,
    refreshTokenHash2: string,
    sessionInfo: any,
    expiresAt: number,
    jwtPayload: any
) {
    userId = stringifyUserId(userId);
    const config = Config.get();
    let query = `INSERT INTO ${config.postgres.tables.refreshTokens} 
    (session_handle, user_id, refresh_token_hash_2,
    session_info, expires_at, jwt_user_payload) VALUES ($1, $2, $3, $4, $5, $6)`;
    await connection.executeQuery(query, [
        sessionHandle,
        userId,
        refreshTokenHash2,
        serialiseSessionInfo(sessionInfo),
        expiresAt,
        serialiseSessionInfo(jwtPayload)
    ]);
}

export async function isSessionBlacklisted(connection: Connection, sessionHandle: string): Promise<boolean> {
    const config = Config.get();
    let query = `SELECT session_handle FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    return result.length === 0;
}

export async function getSessionObject_Transaction(
    connection: Connection,
    sessionHandle: string
): Promise<
    | {
          userId: string | number;
          refreshTokenHash2: string;
          sessionInfo: any;
          expiresAt: number;
          jwtPayload: any;
      }
    | undefined
> {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading session data");
    let query = `SELECT user_id,
    refresh_token_hash_2, session_info,
    expires_at, jwt_user_payload FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1 FOR UPDATE`;
    let result = await connection.executeQuery(query, [sessionHandle]);
    if (result.length === 0) {
        return undefined;
    }
    let row = result[0];
    return {
        userId: parseUserIdToCorrectFormat(row.user_id),
        refreshTokenHash2: row.refresh_token_hash_2,
        sessionInfo: unserialiseSessionInfo(row.session_info),
        expiresAt: Number(row.expires_at),
        jwtPayload: unserialiseSessionInfo(row.jwt_user_payload)
    };
}

export async function updateSessionObject_Transaction(
    connection: Connection,
    sessionHandle: string,
    refreshTokenHash2: string,
    sessionInfo: any,
    expiresAt: number
): Promise<number> {
    const config = Config.get();
    connection.throwIfTransactionIsNotStarted("expected to be in transaction when updating session data");
    let query = `UPDATE ${config.postgres.tables.refreshTokens} SET refresh_token_hash_2 = $1, 
    session_info = $2, expires_at = $3 WHERE session_handle = $4 RETURNING *`;
    let result = await connection.executeQuery(query, [
        refreshTokenHash2,
        serialiseSessionInfo(sessionInfo),
        expiresAt,
        sessionHandle
    ]);
    return result.length;
}

export async function getAllSessionHandlesForUser(connection: Connection, userId: string | number): Promise<string[]> {
    userId = stringifyUserId(userId);
    const config = Config.get();
    let query = `SELECT session_handle FROM ${config.postgres.tables.refreshTokens} WHERE user_id = $1`;
    let result = await connection.executeQuery(query, [userId]);
    return result.map((i: any) => i.session_handle.toString());
}

export async function deleteAllExpiredSessions(connection: Connection) {
    const config = Config.get();
    const query = `DELETE FROM ${config.postgres.tables.refreshTokens} WHERE expires_at <= $1;`;
    await connection.executeQuery(query, [Date.now()]);
}

function serialiseSessionInfo(data: any): string {
    if (data === undefined) {
        return "";
    } else {
        return JSON.stringify(data);
    }
}

function unserialiseSessionInfo(data: string): any {
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
    let query = `DROP TABLE IF EXISTS ${config.postgres.tables.refreshTokens}, ${config.postgres.tables.signingKey};`;
    await connection.executeQuery(query, []);
}

export async function getNumberOfRowsInRefreshTokensTable(): Promise<number> {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    let connection = await getConnection();
    try {
        const config = Config.get();
        let query = `SELECT COUNT(*) AS rowscount FROM ${config.postgres.tables.refreshTokens};`;
        let result = await connection.executeQuery(query, []);
        return Number(result[0].rowscount);
    } finally {
        connection.closeConnection();
    }
}

export async function removeOldSessions() {
    let connection = await getConnection();
    try {
        await deleteAllExpiredSessions(connection);
    } finally {
        connection.closeConnection();
    }
}
