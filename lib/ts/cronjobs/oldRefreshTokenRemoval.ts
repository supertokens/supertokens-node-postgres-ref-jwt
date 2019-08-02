import { deleteAllExpiredSessions } from "../helpers/dbQueries";
import { getConnection } from "../helpers/mysql";

/**
 * @description removes expired sessions. Even if this does not run, it is OK since we check if a session has expired in our logic anways.
 * The purpose of this is only to clean up the table.
 */
export default async function oldRefreshTokenRemoval() {
    const mysqlConnection = await getConnection();
    try {
        await deleteAllExpiredSessions(mysqlConnection);
    } finally {
        mysqlConnection.closeConnection();
    }
}
