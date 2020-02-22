/// <reference types="node" />
import * as express from "express";
import { ServerResponse, IncomingMessage } from "http";
/**
 * @description clears all the auth cookies from the response
 */
export declare function clearSessionFromCookie(res: express.Response): void;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
export declare function attachAccessTokenToCookie(res: express.Response, token: string, expiry: number): void;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
export declare function attachRefreshTokenToCookie(res: express.Response, token: string, expiry: number): void;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
export declare function setIdRefreshTokenInHeaderAndCookie(res: express.Response, token: string, expiry: number): void;
export declare function getAccessTokenFromCookie(req: express.Request): string | undefined;
export declare function getRefreshTokenFromCookie(req: express.Request): string | undefined;
export declare function getIdRefreshTokenFromCookie(req: express.Request): string | undefined;
export declare function getAntiCsrfTokenFromHeaders(req: express.Request): string | undefined;
export declare function setAntiCsrfTokenInHeadersIfRequired(res: express.Response, antiCsrfToken: string | undefined): void;
export declare function getHeader(req: express.Request, key: string): string | undefined;
export declare function setOptionsAPIHeader(res: express.Response): void;
/**
 *
 * @param res
 * @param name
 * @param value
 * @param domain
 * @param secure
 * @param httpOnly
 * @param expires
 * @param path
 */
export declare function setCookie(res: ServerResponse, name: string, value: string, domain: string, secure: boolean, httpOnly: boolean, expires: number, path: string): ServerResponse;
export declare function getCookieValue(req: IncomingMessage, key: string): string | undefined;
