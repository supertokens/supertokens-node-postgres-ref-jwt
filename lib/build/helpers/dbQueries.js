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
const config_1 = require("../config");
const error_1 = require("../error");
const postgres_1 = require("./postgres");
const utils_1 = require("./utils");
/**
 * @description contains all the mysql queries.
 * @throws AuthError GENERAL_ERROR
 */
/**
 * @param connection
 * @param tableName
 * @throws error if the tables don't exist.
 */
function checkIfTableExists(connection, tableName) {
    return __awaiter(this, void 0, void 0, function*() {
        const query = `SELECT 1 FROM ${tableName} LIMIT 1`;
        yield connection.executeQuery(query, []);
    });
}
exports.checkIfTableExists = checkIfTableExists;
/**
 * @param connection
 * @param signingKeyTableName
 * @param refreshTokensTableName
 */
function createTablesIfNotExists(connection, signingKeyTableName, refreshTokensTableName) {
    return __awaiter(this, void 0, void 0, function*() {
        const signKeyTableQuery = `
            CREATE TABLE IF NOT EXISTS ${signingKeyTableName} (
                key_name VARCHAR(128),
                key_value VARCHAR(255),
                created_at_time TIMESTAMPTZ(3),
                PRIMARY KEY(key_name)
            );
        `;
        const refreshTokensTableQuery = `
            CREATE TABLE IF NOT EXISTS ${refreshTokensTableName} (
                session_handle VARCHAR(255) NOT NULL,
                user_id VARCHAR(128) NOT NULL,
                refresh_token_hash_2 VARCHAR(128) NOT NULL,
                session_info TEXT,
                expires_at TIMESTAMPTZ(3),
                jwt_user_payload TEXT,
                PRIMARY KEY(session_handle)
            );
        `;
        const signKeyTableQueryPromise = connection.executeQuery(signKeyTableQuery, []);
        const refreshTokensTableQueryPromise = connection.executeQuery(refreshTokensTableQuery, []);
        yield signKeyTableQueryPromise;
        yield refreshTokensTableQueryPromise;
    });
}
exports.createTablesIfNotExists = createTablesIfNotExists;
function getKeyValueFromKeyName_Transaction(connection, keyName) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading signing keys");
        let query = `SELECT key_value, created_at_time FROM ${
            config.postgres.tables.signingKey
        } WHERE key_name = $1 FOR UPDATE`;
        let result = yield connection.executeQuery(query, [keyName]);
        if (result.length === 0) {
            return undefined;
        }
        return {
            keyValue: result[0].key_value.toString(),
            createdAtTime: convertTimestampToMilli(result[0].created_at_time)
        };
    });
}
exports.getKeyValueFromKeyName_Transaction = getKeyValueFromKeyName_Transaction;
function insertKeyValueForKeyName_Transaction(connection, keyName, keyValue, createdAtTime) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading signing keys");
        let query = `INSERT INTO ${
            config.postgres.tables.signingKey
        }(key_name, key_value, created_at_time) VALUES ($1, $2, to_timestamp($3)) ON CONFLICT (key_name) DO UPDATE SET key_value = $4, created_at_time = to_timestamp($5)`;
        yield connection.executeQuery(query, [keyName, keyValue, createdAtTime, keyValue, createdAtTime]);
    });
}
exports.insertKeyValueForKeyName_Transaction = insertKeyValueForKeyName_Transaction;
function updateSessionData(connection, sessionHandle, sessionData) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let query = `UPDATE ${
            config.postgres.tables.refreshTokens
        } SET session_info = $1 WHERE session_handle = $2 RETURNING *`;
        let result = yield connection.executeQuery(query, [serialiseSessionData(sessionData), sessionHandle]);
        return result.length;
    });
}
exports.updateSessionData = updateSessionData;
function getSessionData(connection, sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let query = `SELECT session_info FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1`;
        let result = yield connection.executeQuery(query, [sessionHandle]);
        if (result.length === 0) {
            return {
                found: false
            };
        }
        return {
            found: true,
            data: unserialiseSessionData(result[0].session_info)
        };
    });
}
exports.getSessionData = getSessionData;
function deleteSession(connection, sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let query = `DELETE FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1 RETURNING *`;
        let result = yield connection.executeQuery(query, [sessionHandle]);
        return result.length;
    });
}
exports.deleteSession = deleteSession;
function createNewSession(connection, sessionHandle, userId, refreshTokenHash2, sessionData, expiresAt, jwtPayload) {
    return __awaiter(this, void 0, void 0, function*() {
        userId = utils_1.stringifyUserId(userId);
        const config = config_1.default.get();
        let query = `INSERT INTO ${config.postgres.tables.refreshTokens} 
    (session_handle, user_id, refresh_token_hash_2,
    session_info, expires_at, jwt_user_payload) VALUES ($1, $2, $3, $4, to_timestamp($5), $6)`;
        yield connection.executeQuery(query, [
            sessionHandle,
            userId,
            refreshTokenHash2,
            serialiseSessionData(sessionData),
            expiresAt,
            serialiseSessionData(jwtPayload)
        ]);
    });
}
exports.createNewSession = createNewSession;
function isSessionBlacklisted(connection, sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        let query = `SELECT session_handle FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1`;
        let result = yield connection.executeQuery(query, [sessionHandle]);
        return result.length === 0;
    });
}
exports.isSessionBlacklisted = isSessionBlacklisted;
function getSessionInfo_Transaction(connection, sessionHandle) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        connection.throwIfTransactionIsNotStarted("expected to be in transaction when reading session data");
        let query = `SELECT user_id,
    refresh_token_hash_2, session_info,
    expires_at, jwt_user_payload FROM ${config.postgres.tables.refreshTokens} WHERE session_handle = $1 FOR UPDATE`;
        let result = yield connection.executeQuery(query, [sessionHandle]);
        if (result.length === 0) {
            return undefined;
        }
        let row = result[0];
        return {
            userId: utils_1.parseUserIdToCorrectFormat(row.user_id),
            refreshTokenHash2: row.refresh_token_hash_2,
            sessionData: unserialiseSessionData(row.session_info),
            expiresAt: convertTimestampToMilli(row.expires_at),
            jwtPayload: unserialiseSessionData(row.jwt_user_payload)
        };
    });
}
exports.getSessionInfo_Transaction = getSessionInfo_Transaction;
function updateSessionInfo_Transaction(connection, sessionHandle, refreshTokenHash2, sessionData, expiresAt) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        connection.throwIfTransactionIsNotStarted("expected to be in transaction when updating session data");
        let query = `UPDATE ${config.postgres.tables.refreshTokens} SET refresh_token_hash_2 = $1, 
    session_info = $2, expires_at = to_timestamp($3) WHERE session_handle = $4 RETURNING *`;
        let result = yield connection.executeQuery(query, [
            refreshTokenHash2,
            serialiseSessionData(sessionData),
            expiresAt,
            sessionHandle
        ]);
        return result.length;
    });
}
exports.updateSessionInfo_Transaction = updateSessionInfo_Transaction;
function getAllSessionHandlesForUser(connection, userId) {
    return __awaiter(this, void 0, void 0, function*() {
        userId = utils_1.stringifyUserId(userId);
        const config = config_1.default.get();
        let query = `SELECT session_handle FROM ${config.postgres.tables.refreshTokens} WHERE user_id = $1`;
        let result = yield connection.executeQuery(query, [userId]);
        return result.map(i => i.session_handle.toString());
    });
}
exports.getAllSessionHandlesForUser = getAllSessionHandlesForUser;
function deleteAllExpiredSessions(connection) {
    return __awaiter(this, void 0, void 0, function*() {
        const config = config_1.default.get();
        const query = `DELETE FROM ${config.postgres.tables.refreshTokens} WHERE expires_at <= to_timestamp($1);`;
        yield connection.executeQuery(query, [Date.now()]);
    });
}
exports.deleteAllExpiredSessions = deleteAllExpiredSessions;
function serialiseSessionData(data) {
    if (data === undefined) {
        return "";
    } else {
        return JSON.stringify(data);
    }
}
function unserialiseSessionData(data) {
    if (data === "") {
        return undefined;
    } else {
        try {
            return JSON.parse(data);
        } catch (err) {
            throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
        }
    }
}
function resetTables(connection) {
    return __awaiter(this, void 0, void 0, function*() {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        const config = config_1.default.get();
        let query = `DROP TABLE IF EXISTS ${config.postgres.tables.refreshTokens}, ${
            config.postgres.tables.signingKey
        };`;
        yield connection.executeQuery(query, []);
    });
}
exports.resetTables = resetTables;
function getNumberOfRowsInRefreshTokensTable() {
    return __awaiter(this, void 0, void 0, function*() {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        let connection = yield postgres_1.getConnection();
        try {
            const config = config_1.default.get();
            let query = `SELECT COUNT(*) AS rowscount FROM ${config.postgres.tables.refreshTokens};`;
            let result = yield connection.executeQuery(query, []);
            return Number(result[0].rowscount);
        } finally {
            connection.closeConnection();
        }
    });
}
exports.getNumberOfRowsInRefreshTokensTable = getNumberOfRowsInRefreshTokensTable;
function convertTimestampToMilli(ts) {
    return new Date(ts).getTime() / 1000;
}
//# sourceMappingURL=dbQueries.js.map
