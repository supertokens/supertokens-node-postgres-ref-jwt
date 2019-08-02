"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./helpers/logging");
const ERROR_MAGIC = "ndskajfasndlfkj435234krjdsa";
function generateError(errType, err, log = true) {
    if (AuthError.isErrorFromAuth(err)) {
        return err;
    }
    if (log) {
        logging_1.errorLogging(err);
    }
    return {
        errMagic: ERROR_MAGIC,
        errType,
        err
    };
}
exports.generateError = generateError;
class AuthError {}
AuthError.GENERAL_ERROR = 1000;
AuthError.UNAUTHORISED = 2000;
AuthError.TRY_REFRESH_TOKEN = 3000;
AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED = 4000;
AuthError.isErrorFromAuth = err => {
    return err.errMagic === ERROR_MAGIC;
};
exports.AuthError = AuthError;
//# sourceMappingURL=error.js.map
