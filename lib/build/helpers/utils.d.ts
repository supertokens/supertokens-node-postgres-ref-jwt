import { TypeInputConfig } from "./types";
/**
 * number of iterations is 32 here. To make this "more random", increase this value. But know that doing so will increase the amount of time it takes to generate a key.
 */
export declare function generateNewSigningKey(): Promise<string>;
export declare function generateUUID(): string;
export declare function hash(toHash: string): string;
export declare function hmac(text: string, key: string): string;
/**
 * Encrypts text by given key
 * @param text text to encrypt
 * @param masterKey key used to encrypt
 * @returns String encrypted text, base64 encoded
 */
export declare function encrypt(text: string, masterkey: string): Promise<string>;
/**
 * Decrypts text by given key
 * @param encdata base64 encoded input data
 * @param masterkey key used to decrypt
 * @returns String decrypted (original) text
 */
export declare function decrypt(encdata: string, masterkey: string): Promise<string>;
/**
 *
 * @param field
 */
export declare function sanitizeStringInput(field: any): string | undefined;
/**
 *
 * @param field
 */
export declare function sanitizeNumberInput(field: any): number | undefined;
/**
 *
 * @param field
 */
export declare function sanitizeBooleanInput(field: any): boolean | undefined;
/**
 * @description used in testing to reset all the singletons. Please do not use this outside of testing
 * @param newConfig this can be undefined because if you actually want to test the init function itself after reset.
 */
export declare function reset(newConfig?: TypeInputConfig): Promise<void>;
/**
 *
 * @param timeInMilliseconds
 */
export declare function delay(timeInMilliseconds: number): Promise<unknown>;
export declare function generateSessionHandle(): string;
export declare function assertUserIdHasCorrectType(userId: any): void;
export declare function stringifyUserId(userId: any): string;
export declare function parseUserIdToCorrectFormat(userId: string): string | number;
