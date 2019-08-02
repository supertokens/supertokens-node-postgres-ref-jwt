import { hmac } from "./utils";

/**
 * @description library is meant to only create and verify JWTs. It does not care about the payload itself.
 */

const HEADER = Buffer.from(
    JSON.stringify({
        alg: "HS256",
        typ: "JWT"
    })
).toString("base64");

export function createJWT(plainTextPayload: { [key: string]: any }, signingKey: string): string {
    const payload = Buffer.from(JSON.stringify(plainTextPayload)).toString("base64");
    const signature = hmac(HEADER + "." + payload, signingKey);
    return `${HEADER}.${payload}.${signature}`;
}

/**
 *
 * @throws Error if verifications fail.. or anything goes wrong.
 */
export function verifyJWTAndGetPayload(jwt: string, signingKey: string): { [key: string]: any } {
    const splittedInput = jwt.split(".");
    if (splittedInput.length !== 3) {
        throw new Error("invalid jwt");
    }

    // checking header
    if (splittedInput[0] !== HEADER) {
        throw new Error("jwt header mismatch");
    }

    // verifying signature
    let payload = splittedInput[1];
    const signatureFromHeaderAndPayload = hmac(HEADER + "." + payload, signingKey);
    if (signatureFromHeaderAndPayload !== splittedInput[2]) {
        throw new Error("jwt verification failed");
    }

    // sending payload
    payload = Buffer.from(payload, "base64").toString();
    return JSON.parse(payload);
}
