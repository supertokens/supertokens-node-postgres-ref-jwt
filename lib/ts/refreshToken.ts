import Config from "./config";
import { AuthError, generateError } from "./error";
import { getKeyValueFromKeyName_Transaction, insertKeyValueForKeyName_Transaction } from "./helpers/dbQueries";
import { getConnection } from "./helpers/mysql";
import {
    decrypt,
    encrypt,
    generateNewSigningKey,
    generateUUID,
    hash,
    sanitizeNumberInput,
    sanitizeStringInput
} from "./helpers/utils";

/**
 * @description: called during library init. Should be called after initing Config and MySQL.
 */
export async function init() {
    let config = Config.get();
    await Key.init();
}

/**
 * @description used during testing only.
 */
export async function reset() {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    Key.reset();
}

/**
 * @description used during testing only.
 */
export async function getKeyForTesting(): Promise<string> {
    if (process.env.TEST_MODE !== "testing") {
        throw Error("call this function only during testing");
    }
    return await Key.getKey();
}

/**
 * @description given a token, it verifies it with the stored signature and returns the payload contained in it
 * @throws AuthError GENERAL_ERROR UNAUTHORISED
 */
export async function getInfoFromRefreshToken(
    token: string
): Promise<{
    sessionHandle: string;
    userId: string | number;
    parentRefreshTokenHash1: string | undefined;
}> {
    let key = await Key.getKey();
    try {
        let splittedToken = token.split(".");
        if (splittedToken.length !== 2) {
            throw Error("invalid refresh token");
        }
        let nonce = splittedToken[1];
        let payload = JSON.parse(await decrypt(splittedToken[0], key));
        let sessionHandle = sanitizeStringInput(payload.sessionHandle);
        let userId =
            sanitizeNumberInput(payload.userId) === undefined
                ? sanitizeStringInput(payload.userId)
                : sanitizeNumberInput(payload.userId);
        let prt = sanitizeStringInput(payload.prt);
        let nonceFromEnc = sanitizeStringInput(payload.nonce);
        if (sessionHandle === undefined || userId === undefined || nonceFromEnc !== nonce) {
            throw Error("invalid refresh token");
        }
        return {
            sessionHandle,
            userId,
            parentRefreshTokenHash1: prt
        };
    } catch (err) {
        throw generateError(AuthError.UNAUTHORISED, err);
    }
}

/**
 * @description given token payload, it creates a new token that is signed by a key stored in the DB.
 * Note: The expiry time of the token is not in the token itself. This may result in the token being alive for a longer duration
 * than what is desired. We can easily fix this by adding the expiry time in the token
 * @throws AuthError GENERAL_ERROR
 */
export async function createNewRefreshToken(
    sessionHandle: string,
    userId: string | number,
    parentRefreshTokenHash1: string | undefined
): Promise<{ token: string; expiry: number }> {
    // token = key1({funcArgs + nonce}).nonce where key1(a) = a encrypted using key1
    // we have the nonce for 2 reasons: given same arguments, the token would be different,
    // and it can be used to verify that the token was indeed created by us.
    let config = Config.get();
    let key = await Key.getKey();
    let nonce = hash(generateUUID());
    let payloadSerialised = JSON.stringify({
        sessionHandle,
        userId,
        prt: parentRefreshTokenHash1,
        nonce
    });
    let encryptedPart = await encrypt(payloadSerialised, key);
    return {
        token: encryptedPart + "." + nonce,
        expiry: Date.now() + config.tokens.refreshToken.validity
    };
}

const REFRESH_TOKEN_KEY_NAME_IN_DB = "refresh_token_key";
/**
 * @class Key
 * @description this is a singleton class since there is just one key in the whole system for refresh tokens
 */
class Key {
    private key: string | undefined;
    private static instance: Key | undefined;

    private constructor() {}

    /**
     * @description called when libraries' init is called. Creates and stores an encryption/decryption key to be used if not already there.
     */
    static init = async () => {
        if (Key.instance === undefined) {
            Key.instance = new Key();
            await Key.getKey();
        }
    };

    /**
     * @description used during testing only
     * The key in the database will be removed by the /helpers/utils - reset
     */
    static reset = () => {
        if (process.env.TEST_MODE !== "testing") {
            throw Error("call this function only during testing");
        }
        Key.instance = undefined;
    };

    private getKeyFromInstance = async (): Promise<string> => {
        if (this.key === undefined) {
            this.key = await this.generateNewKeyAndUpdateInDb();
        }
        return this.key;
    };

    /**
     * @description Generates a new key in a way that takes race conditions in account in case there are multiple node processes running.
     */
    private generateNewKeyAndUpdateInDb = async (): Promise<string> => {
        let connection = await getConnection();
        try {
            await connection.startTransaction();
            let key = await getKeyValueFromKeyName_Transaction(connection, REFRESH_TOKEN_KEY_NAME_IN_DB);
            if (key === undefined) {
                let keyValue = await generateNewSigningKey();
                key = {
                    keyValue,
                    createdAtTime: Date.now()
                };
                await insertKeyValueForKeyName_Transaction(
                    connection,
                    REFRESH_TOKEN_KEY_NAME_IN_DB,
                    key.keyValue,
                    key.createdAtTime
                );
            }
            await connection.commit();
            return key.keyValue;
        } finally {
            connection.closeConnection();
        }
    };

    static getKey = async (): Promise<string> => {
        if (Key.instance === undefined) {
            throw generateError(AuthError.GENERAL_ERROR, new Error("please call init function of refresh token key"));
        }
        return await Key.instance.getKeyFromInstance();
    };
}
