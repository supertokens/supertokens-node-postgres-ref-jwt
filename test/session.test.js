const session = require("../");
const assert = require("assert");
const { reset, delay } = require("../lib/build/helpers/utils");
const config = require("./config");
const { getNumberOfRowsInRefreshTokensTable } = require("../lib/build/helpers/dbQueries");
const { printPath } = require("./utils");
const errors = require("../lib/build/error");

describe(`Session: ${printPath("[test/session.test.js]")}`, function() {
    it("testing non-string userId (number)", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        const userId = 1;
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "number");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(typeof newSession.antiCsrfToken, "string");
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "number");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "number");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
    });

    it("testing number as string userId", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        const userId = "1";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "string");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(typeof newSession.antiCsrfToken, "string");
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "string");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
    });

    it("testing stringified JSON userId (single field)", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        const userId = JSON.stringify({ a: "testing" });
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "string");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(typeof newSession.antiCsrfToken, "string");
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "string");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
    });

    it("testing stringified JSON userId (multiple fields)", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        const userId = JSON.stringify({ a: "testing", i: "supertokens" });
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "string");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(typeof newSession.antiCsrfToken, "string");
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "string");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
    });

    it("testing invalid stringified JSON userId", async function() {
        await reset(config.minConfigTest);
        const userId = JSON.stringify({ i: "testing" });
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        try {
            await session.createNewSession(userId, jwtPayload, sessionData);
        } catch (err) {
            if (err.errType !== errors.AuthError.GENERAL_ERROR) {
                throw err;
            }
        }
    });

    it("create and get session", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "string");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(typeof newSession.antiCsrfToken, "string");
        const noOfRows = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRows, 1);
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);

        try {
            await session.getSession(newSession.accessToken, "wrong-anti-csrf-token");
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
    });

    it("create and get session (anti-csrf disabled)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTestWithAntiCsrfDisabled);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.accessToken.expires, "number");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken.expires, "number");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken.expires, "number");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSession.session.userId, "string");
        assert.deepStrictEqual(newSession.session.userId, userId);
        assert.deepStrictEqual(newSession.antiCsrfToken, undefined);
        const noOfRows = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRows, 1);
        const sessionInfo = await session.getSession(newSession.accessToken.value, null);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await session.getSession(newSession.accessToken.value, "wrong-anti-csrf-token");
    });

    it("create and get session: [access token expires after 1 secs]", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortValidityForAccessToken);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
    });

    it("create and get session: [jwt signinkey changes after <2s]", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortSigningKeyUpdateInterval);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.antiCsrfToken, "string");
        await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        await delay(2000);
        try {
            await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
        const sessionInfo = await session.getSession(
            newRefreshedSession.newAccessToken.value,
            newRefreshedSession.newAntiCsrfToken
        );
        assert.strictEqual(typeof sessionInfo, "object");
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
    });

    it("alter access token payload", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.antiCsrfToken, "string");
        await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        const alteredPayload = Buffer.from(JSON.stringify({ ...jwtPayload, b: "new field" })).toString("base64");
        const alteredToken = `${newSession.accessToken.value.split(".")[0]}.${alteredPayload}.${
            newSession.accessToken.value.split(".")[2]
        }`;
        try {
            await session.getSession(alteredToken, newSession.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
    });

    it("refresh session (with anti-csrf)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortValidityForAccessToken);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.strictEqual(typeof newSession.antiCsrfToken, "string");
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "string");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.strictEqual(typeof newRefreshedSession.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession.newAntiCsrfToken, newSession.antiCsrfToken);
        const sessionInfo = await session.getSession(
            newRefreshedSession.newAccessToken.value,
            newRefreshedSession.newAntiCsrfToken
        );
        assert.strictEqual(typeof sessionInfo, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, sessionInfo.newAccessToken.value);
        assert.strictEqual(typeof sessionInfo.newAccessToken.expires, "number");
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        const newSessionInfo = await session.getSession(
            sessionInfo.newAccessToken.value,
            newRefreshedSession.newAntiCsrfToken
        );
        assert.strictEqual(typeof newSessionInfo, "object");
        assert.deepStrictEqual(newSessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof newSessionInfo.session, "object");
        assert.strictEqual(typeof newSessionInfo.session.handle, "string");
        assert.strictEqual(typeof newSessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(newSessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSessionInfo.session.userId, "string");
        assert.deepStrictEqual(newSessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(sessionInfo.newAccessToken.value, newRefreshedSession.newAntiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession2 = await session.refreshSession(newRefreshedSession.newRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession2, "object");
        assert.strictEqual(typeof newRefreshedSession2.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession2.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession2.newAccessToken.value, sessionInfo.newAccessToken.value);
        assert.strictEqual(typeof newRefreshedSession2.newAntiCsrfToken, "string");
        assert.notStrictEqual(newRefreshedSession2.newAntiCsrfToken, newRefreshedSession.antiCsrfToken);
        const sessionInfo2 = await session.getSession(
            newRefreshedSession2.newAccessToken.value,
            newRefreshedSession2.newAntiCsrfToken
        );
        assert.strictEqual(typeof sessionInfo2, "object");
        assert.strictEqual(typeof sessionInfo2.newAccessToken, "object");
        assert.strictEqual(typeof sessionInfo2.newAccessToken.value, "string");
        assert.notDeepStrictEqual(sessionInfo.newAccessToken.value, sessionInfo2.newAccessToken.value);
    });

    it("refresh session (with anti-csrf disabled)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortValidityForAccessTokenAndAntiCsrfDisabled);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        assert.strictEqual(typeof newSession.idRefreshToken, "object");
        assert.strictEqual(typeof newSession.idRefreshToken.value, "string");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        assert.deepStrictEqual(newSession.antiCsrfToken, undefined);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, newSession.accessToken.value);
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newIdRefreshToken.value, newSession.idRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newIdRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newRefreshToken.value, newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession.newRefreshToken.expires, "number");
        assert.strictEqual(typeof newRefreshedSession.session, "object");
        assert.strictEqual(typeof newRefreshedSession.session.handle, "string");
        assert.strictEqual(typeof newRefreshedSession.session.jwtPayload, "object");
        assert.deepStrictEqual(newRefreshedSession.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newRefreshedSession.session.userId, "string");
        assert.deepStrictEqual(newRefreshedSession.session.userId, userId);
        assert.deepStrictEqual(newRefreshedSession.newAntiCsrfToken, undefined);
        const sessionInfo = await session.getSession(newRefreshedSession.newAccessToken.value, null);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, sessionInfo.newAccessToken.value);
        assert.strictEqual(typeof sessionInfo.newAccessToken.expires, "number");
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        const newSessionInfo = await session.getSession(sessionInfo.newAccessToken.value, null);
        assert.strictEqual(typeof newSessionInfo, "object");
        assert.deepStrictEqual(newSessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof newSessionInfo.session, "object");
        assert.strictEqual(typeof newSessionInfo.session.handle, "string");
        assert.strictEqual(typeof newSessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(newSessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof newSessionInfo.session.userId, "string");
        assert.deepStrictEqual(newSessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(sessionInfo.newAccessToken.value, null);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        const newRefreshedSession2 = await session.refreshSession(newRefreshedSession.newRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession2, "object");
        assert.strictEqual(typeof newRefreshedSession2.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession2.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession2.newAccessToken.value, sessionInfo.newAccessToken.value);
        assert.deepStrictEqual(newRefreshedSession2.newAntiCsrfToken, undefined);
        const sessionInfo2 = await session.getSession(newRefreshedSession2.newAccessToken.value, null);
        assert.strictEqual(typeof sessionInfo2, "object");
        assert.strictEqual(typeof sessionInfo2.newAccessToken, "object");
        assert.strictEqual(typeof sessionInfo2.newAccessToken.value, "string");
        assert.notDeepStrictEqual(sessionInfo.newAccessToken.value, sessionInfo2.newAccessToken.value);
    });

    it("refresh session (refresh token expires after 3 secs)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortValidityForRefreshToken);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        // Part 1
        {
            const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
            assert.strictEqual(typeof newSession, "object");
            assert.strictEqual(typeof newSession.refreshToken, "object");
            assert.strictEqual(typeof newSession.refreshToken.value, "string");
            const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
            assert.strictEqual(typeof newRefreshedSession, "object");
            assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
            assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
            const sessionInfo = await session.getSession(
                newRefreshedSession.newAccessToken.value,
                newRefreshedSession.newAntiCsrfToken
            );
            assert.strictEqual(typeof sessionInfo, "object");
            assert.strictEqual(typeof sessionInfo.newAccessToken, "object");
            assert.strictEqual(typeof sessionInfo.newAccessToken.value, "string");
            assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, sessionInfo.newAccessToken.value);
            await delay(3000);
            try {
                await session.refreshSession(newRefreshedSession.newRefreshToken.value);
                throw Error("test failed");
            } catch (err) {
                if (err.errType !== errors.AuthError.UNAUTHORISED) {
                    throw err;
                }
            }
        }
        // Part 2
        {
            const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
            assert.strictEqual(typeof newSession, "object");
            assert.strictEqual(typeof newSession.refreshToken, "object");
            assert.strictEqual(typeof newSession.refreshToken.value, "string");
            const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
            assert.strictEqual(typeof newRefreshedSession, "object");
            assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
            assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
            await delay(2000);
            const newRefreshedSession2 = await session.refreshSession(newRefreshedSession.newRefreshToken.value);
            assert.strictEqual(typeof newRefreshedSession2, "object");
            assert.strictEqual(typeof newRefreshedSession2.newAccessToken, "object");
            assert.strictEqual(typeof newRefreshedSession2.newAccessToken.value, "string");
            await delay(2000);
            const newRefreshedSession3 = await session.refreshSession(newRefreshedSession2.newRefreshToken.value);
            assert.strictEqual(typeof newRefreshedSession3, "object");
            assert.strictEqual(typeof newRefreshedSession3.newAccessToken, "object");
            assert.strictEqual(typeof newRefreshedSession3.newAccessToken.value, "string");
        }
    });

    it("refresh session (token theft S1->R1->S2->R1)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        const newRefreshedSession = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken, "object");
        assert.strictEqual(typeof newRefreshedSession.newAccessToken.value, "string");
        const sessionInfo = await session.getSession(
            newRefreshedSession.newAccessToken.value,
            newRefreshedSession.newAntiCsrfToken
        );
        assert.strictEqual(typeof sessionInfo, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken, "object");
        assert.strictEqual(typeof sessionInfo.newAccessToken.value, "string");
        assert.notDeepStrictEqual(newRefreshedSession.newAccessToken.value, sessionInfo.newAccessToken.value);
        try {
            await session.refreshSession(newSession.refreshToken.value);
            throw Error("token theft did not get detected");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED) {
                throw err;
            }
            assert.strictEqual(typeof err.err.sessionHandle, "string");
            assert.strictEqual(typeof err.err.userId, "string");
            if (err.err.sessionHandle !== newSession.session.handle || err.err.userId !== newSession.session.userId) {
                throw err;
            }
        }
    });

    it("refresh session (token theft S1->R1->R2->R1)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        const newRefreshedSession1 = await session.refreshSession(newSession.refreshToken.value);
        assert.strictEqual(typeof newRefreshedSession1, "object");
        assert.strictEqual(typeof newRefreshedSession1.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession1.newRefreshToken.value, "string");
        const newRefreshedSession2 = await session.refreshSession(newRefreshedSession1.newRefreshToken.value);
        assert.strictEqual(typeof newRefreshedSession2, "object");
        assert.strictEqual(typeof newRefreshedSession2.newRefreshToken, "object");
        assert.strictEqual(typeof newRefreshedSession2.newRefreshToken.value, "string");
        assert.notDeepStrictEqual(
            newRefreshedSession2.newRefreshToken.value,
            newRefreshedSession1.newRefreshToken.value
        );
        try {
            await session.refreshSession(newSession.refreshToken.value);
            throw Error("token theft did not get detected");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED) {
                throw err;
            }
            assert.strictEqual(typeof err.err.sessionHandle, "string");
            assert.strictEqual(typeof err.err.userId, "string");
            if (err.err.sessionHandle !== newSession.session.handle || err.err.userId !== newSession.session.userId) {
                throw err;
            }
        }
    });

    it("update session info", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        const sessionDataBeforeUpdate = await session.getSessionData(
            newSession.session.handle,
            newSession.antiCsrfToken
        );
        assert.strictEqual(typeof sessionDataBeforeUpdate, "object");
        assert.deepStrictEqual(sessionData, sessionDataBeforeUpdate);
        const newSessionData = 2;
        await session.updateSessionData(newSession.session.handle, newSessionData);
        const sessionDataPostUpdate = await session.getSessionData(newSession.session.handle, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionDataPostUpdate, "number");
        assert.deepStrictEqual(newSessionData, sessionDataPostUpdate);
    });

    it("revoke session (without blacklisting)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.refreshToken, "object");
        assert.strictEqual(typeof newSession.refreshToken.value, "string");
        const noOfRowsBefore = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsBefore, 2);
        await session.revokeSessionUsingSessionHandle(newSession.session.handle);
        const noOfRowsAfter = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsAfter, 1);
        try {
            await session.refreshSession(newSession.refreshToken.value);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
    });

    it("revoke session (with blacklisting)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTestWithBlacklisting);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession1 = await session.createNewSession(userId, jwtPayload, sessionData);
        const newSession2 = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession1, "object");
        assert.strictEqual(typeof newSession1.session, "object");
        assert.strictEqual(typeof newSession1.session.handle, "string");
        assert.strictEqual(typeof newSession1.refreshToken, "object");
        assert.strictEqual(typeof newSession1.refreshToken.value, "string");
        assert.strictEqual(typeof newSession2, "object");
        assert.strictEqual(typeof newSession2.session, "object");
        assert.strictEqual(typeof newSession2.session.handle, "string");
        assert.strictEqual(typeof newSession2.refreshToken, "object");
        assert.strictEqual(typeof newSession2.refreshToken.value, "string");
        const noOfRowsBefore = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsBefore, 2);
        const sessionInfo1 = await session.getSession(newSession1.accessToken.value, newSession1.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo1, "object");
        assert.deepStrictEqual(sessionInfo1.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo1.session, "object");
        assert.strictEqual(typeof sessionInfo1.session.handle, "string");
        assert.strictEqual(typeof sessionInfo1.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo1.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo1.session.userId, "string");
        assert.deepStrictEqual(sessionInfo1.session.userId, userId);
        await session.revokeSessionUsingSessionHandle(newSession1.session.handle);
        const noOfRowsAfter = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsAfter, 1);
        try {
            await session.refreshSession(newSession1.refreshToken.value);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
        try {
            await session.getSession(newSession1.accessToken.value, newSession1.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
        const sessionInfo2 = await session.getSession(newSession2.accessToken.value, newSession2.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo2, "object");
        assert.deepStrictEqual(sessionInfo2.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo2.session, "object");
        assert.strictEqual(typeof sessionInfo2.session.handle, "string");
        assert.strictEqual(typeof sessionInfo2.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo2.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo2.session.userId, "string");
        assert.deepStrictEqual(sessionInfo2.session.userId, userId);
    });

    it("remove refresh token from db but session will be valid until access token expires", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.configWithShortValidityForAccessToken);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession = await session.createNewSession(userId, jwtPayload, sessionData);
        assert.strictEqual(typeof newSession, "object");
        assert.strictEqual(typeof newSession.session, "object");
        assert.strictEqual(typeof newSession.session.handle, "string");
        assert.strictEqual(typeof newSession.accessToken, "object");
        assert.strictEqual(typeof newSession.accessToken.value, "string");
        await session.revokeSessionUsingSessionHandle(newSession.session.handle);
        const sessionInfo = await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo, "object");
        assert.deepStrictEqual(sessionInfo.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo.session, "object");
        assert.strictEqual(typeof sessionInfo.session.handle, "string");
        assert.strictEqual(typeof sessionInfo.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo.session.userId, "string");
        assert.deepStrictEqual(sessionInfo.session.userId, userId);
        await delay(1500);
        try {
            await session.getSession(newSession.accessToken.value, newSession.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
        try {
            await session.refreshSession(newSession.refreshToken.value);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
    });

    it("revoke all sessions for user (without blacklisting)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTest);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession1 = await session.createNewSession(userId, jwtPayload, sessionData);
        const newSession2 = await session.createNewSession(userId, jwtPayload, sessionData);
        const newSession3 = await session.createNewSession(userId, jwtPayload, sessionData);
        const noOfRowsBefore = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsBefore, 3);
        await session.revokeAllSessionsForUser(userId);
        const noOfRowsAfter = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsAfter, 0);
        const sessionInfo1 = await session.getSession(newSession1.accessToken.value, newSession1.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo1, "object");
        assert.deepStrictEqual(sessionInfo1.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo1.session, "object");
        assert.strictEqual(typeof sessionInfo1.session.handle, "string");
        assert.strictEqual(typeof sessionInfo1.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo1.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo1.session.userId, "string");
        assert.deepStrictEqual(sessionInfo1.session.userId, userId);
        const sessionInfo2 = await session.getSession(newSession2.accessToken.value, newSession2.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo2, "object");
        assert.deepStrictEqual(sessionInfo2.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo2.session, "object");
        assert.strictEqual(typeof sessionInfo2.session.handle, "string");
        assert.strictEqual(typeof sessionInfo2.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo2.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo2.session.userId, "string");
        assert.deepStrictEqual(sessionInfo2.session.userId, userId);
        const sessionInfo3 = await session.getSession(newSession3.accessToken.value, newSession3.antiCsrfToken);
        assert.strictEqual(typeof sessionInfo3, "object");
        assert.deepStrictEqual(sessionInfo3.newAccessToken, undefined);
        assert.strictEqual(typeof sessionInfo3.session, "object");
        assert.strictEqual(typeof sessionInfo3.session.handle, "string");
        assert.strictEqual(typeof sessionInfo3.session.jwtPayload, "object");
        assert.deepStrictEqual(sessionInfo3.session.jwtPayload, jwtPayload);
        assert.strictEqual(typeof sessionInfo3.session.userId, "string");
        assert.deepStrictEqual(sessionInfo3.session.userId, userId);
    });

    it("revoke all sessions for user (with blacklisting)", async function() {
        assert.strictEqual(typeof session.createNewSession, "function");
        assert.strictEqual(typeof session.getSession, "function");
        await reset(config.minConfigTestWithBlacklisting);
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        const newSession1 = await session.createNewSession(userId, jwtPayload, sessionData);
        const newSession2 = await session.createNewSession(userId, jwtPayload, sessionData);
        const newSession3 = await session.createNewSession(userId, jwtPayload, sessionData);
        const noOfRowsBefore = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsBefore, 3);
        await session.revokeAllSessionsForUser(userId);
        const noOfRowsAfter = await getNumberOfRowsInRefreshTokensTable();
        assert.deepStrictEqual(noOfRowsAfter, 0);
        try {
            await session.getSession(newSession1.accessToken.value, newSession1.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
        try {
            await session.getSession(newSession2.accessToken.value, newSession2.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
        try {
            await session.getSession(newSession3.accessToken.value, newSession3.antiCsrfToken);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.UNAUTHORISED) {
                throw err;
            }
        }
    });
});
