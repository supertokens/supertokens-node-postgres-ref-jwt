"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const error_1 = require("./error");
const cookie_1 = require("cookie");
const accessTokenCookieKey = "sAccessToken";
const refreshTokenCookieKey = "sRefreshToken";
const idRefreshTokenCookieKey = "sIdRefreshToken"; // if you change this name and are using supertokens-website or anything that uses is, then be sure to also change the name of this cookie there. To find the usage of this in those packages, you can simply search for "sIdRefreshToken"
const antiCsrfHeaderKey = "anti-csrf";
/**
 * @description clears all the auth cookies from the response
 */
function clearSessionFromCookie(res) {
    let config = config_1.default.get();
    setCookie(
        res,
        accessTokenCookieKey,
        "",
        config.cookie.domain,
        config.cookie.secure,
        true,
        0,
        config.tokens.accessToken.accessTokenPath
    );
    setCookie(
        res,
        idRefreshTokenCookieKey,
        "",
        config.cookie.domain,
        false,
        false,
        0,
        config.tokens.accessToken.accessTokenPath
    );
    setCookie(
        res,
        refreshTokenCookieKey,
        "",
        config.cookie.domain,
        config.cookie.secure,
        true,
        0,
        config.tokens.refreshToken.renewTokenPath
    );
}
exports.clearSessionFromCookie = clearSessionFromCookie;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
function attachAccessTokenToCookie(res, token, expiry) {
    let config = config_1.default.get();
    setCookie(
        res,
        accessTokenCookieKey,
        token,
        config.cookie.domain,
        config.cookie.secure,
        true,
        expiry,
        config.tokens.accessToken.accessTokenPath
    );
}
exports.attachAccessTokenToCookie = attachAccessTokenToCookie;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
function attachRefreshTokenToCookie(res, token, expiry) {
    let config = config_1.default.get();
    setCookie(
        res,
        refreshTokenCookieKey,
        token,
        config.cookie.domain,
        config.cookie.secure,
        true,
        expiry,
        config.tokens.refreshToken.renewTokenPath
    );
}
exports.attachRefreshTokenToCookie = attachRefreshTokenToCookie;
/**
 * @param expiry: must be time in milliseconds from epoch time.
 */
function attachIdRefreshTokenToCookie(res, token, expiry) {
    let config = config_1.default.get();
    setCookie(
        res,
        idRefreshTokenCookieKey,
        token,
        config.cookie.domain,
        false,
        false,
        expiry,
        config.tokens.accessToken.accessTokenPath
    );
}
exports.attachIdRefreshTokenToCookie = attachIdRefreshTokenToCookie;
function getAccessTokenFromCookie(req) {
    return getCookieValue(req, accessTokenCookieKey);
}
exports.getAccessTokenFromCookie = getAccessTokenFromCookie;
function getRefreshTokenFromCookie(req) {
    return getCookieValue(req, refreshTokenCookieKey);
}
exports.getRefreshTokenFromCookie = getRefreshTokenFromCookie;
function getIdRefreshTokenFromCookie(req) {
    return getCookieValue(req, idRefreshTokenCookieKey);
}
exports.getIdRefreshTokenFromCookie = getIdRefreshTokenFromCookie;
function getAntiCsrfTokenFromHeaders(req) {
    return getHeader(req, antiCsrfHeaderKey);
}
exports.getAntiCsrfTokenFromHeaders = getAntiCsrfTokenFromHeaders;
function setAntiCsrfTokenInHeadersIfRequired(res, antiCsrfToken) {
    let config = config_1.default.get();
    if (config.tokens.enableAntiCsrf) {
        if (antiCsrfToken === undefined) {
            throw error_1.generateError(
                error_1.AuthError.GENERAL_ERROR,
                Error("BUG: anti-csrf token is undefined. if you are getting this error, please report it as bug.")
            );
        }
        setHeader(res, antiCsrfHeaderKey, antiCsrfToken);
        setHeader(res, "Access-Control-Expose-Headers", antiCsrfHeaderKey);
    }
}
exports.setAntiCsrfTokenInHeadersIfRequired = setAntiCsrfTokenInHeadersIfRequired;
function getHeader(req, key) {
    let value = req.headers[key];
    if (value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}
exports.getHeader = getHeader;
function setOptionsAPIHeader(res) {
    setHeader(res, "Access-Control-Allow-Headers", antiCsrfHeaderKey);
    setHeader(res, "Access-Control-Allow-Credentials", "true");
}
exports.setOptionsAPIHeader = setOptionsAPIHeader;
function setHeader(res, key, value) {
    try {
        let existingHeaders = res.getHeaders();
        let existingValue = existingHeaders[key.toLowerCase()];
        if (existingValue === undefined) {
            res.header(key, value);
        } else {
            res.header(key, existingValue + ", " + value);
        }
    } catch (err) {
        throw error_1.generateError(error_1.AuthError.GENERAL_ERROR, err);
    }
}
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
function setCookie(res, name, value, domain, secure, httpOnly, expires, path) {
    let opts = {
        domain,
        secure,
        httpOnly,
        expires: new Date(expires),
        path
    };
    return append(res, "Set-Cookie", cookie_1.serialize(name, value, opts));
}
exports.setCookie = setCookie;
/**
 * Append additional header `field` with value `val`.
 *
 * Example:
 *
 *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
 *
 * @param {ServerResponse} res
 * @param {string} field
 * @param {string| string[]} val
 */
function append(res, field, val) {
    let prev = res.getHeader(field);
    let value = val;
    if (prev !== undefined) {
        // concat the new and prev vals
        value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [prev].concat(val) : [prev, val];
    }
    value = Array.isArray(value) ? value.map(String) : String(value);
    res.setHeader(field, value);
    return res;
}
function getCookieValue(req, key) {
    if (req.cookies) {
        return req.cookies[key];
    }
    let cookies = req.headers.cookie;
    if (cookies === undefined) {
        return undefined;
    }
    cookies = cookie_1.parse(cookies);
    // parse JSON cookies
    cookies = JSONCookies(cookies);
    return cookies[key];
}
exports.getCookieValue = getCookieValue;
/**
 * Parse JSON cookie string.
 *
 * @param {String} str
 * @return {Object} Parsed object or undefined if not json cookie
 * @public
 */
function JSONCookie(str) {
    if (typeof str !== "string" || str.substr(0, 2) !== "j:") {
        return undefined;
    }
    try {
        return JSON.parse(str.slice(2));
    } catch (err) {
        return undefined;
    }
}
/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 * @public
 */
function JSONCookies(obj) {
    let cookies = Object.keys(obj);
    let key;
    let val;
    for (let i = 0; i < cookies.length; i++) {
        key = cookies[i];
        val = JSONCookie(obj[key]);
        if (val) {
            obj[key] = val;
        }
    }
    return obj;
}
//# sourceMappingURL=cookieAndHeaders.js.map
