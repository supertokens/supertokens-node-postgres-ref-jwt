export declare function createJWT(plainTextPayload: {
    [key: string]: any;
}, signingKey: string): string;
/**
 *
 * @throws Error if verifications fail.. or anything goes wrong.
 */
export declare function verifyJWTAndGetPayload(jwt: string, signingKey: string): {
    [key: string]: any;
};
