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
const dbQueries_1 = require("../helpers/dbQueries");
const mysql_1 = require("../helpers/mysql");
/**
 * @description removes expired sessions. Even if this does not run, it is OK since we check if a session has expired in our logic anways.
 * The purpose of this is only to clean up the table.
 */
function oldRefreshTokenRemoval() {
    return __awaiter(this, void 0, void 0, function*() {
        const mysqlConnection = yield mysql_1.getConnection();
        try {
            yield dbQueries_1.deleteAllExpiredSessions(mysqlConnection);
        } finally {
            mysqlConnection.closeConnection();
        }
    });
}
exports.default = oldRefreshTokenRemoval;
//# sourceMappingURL=oldRefreshTokenRemoval.js.map
