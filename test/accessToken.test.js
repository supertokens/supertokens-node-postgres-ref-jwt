const config = require("./config");
const assert = require("assert");
const { reset, delay } = require("../lib/build/helpers/utils");
const accessToken = require("../lib/build/accessToken");
const errors = require("../lib/build/error");
const { printPath } = require("./utils");

describe(`Access Token: ${printPath("[test/accessToken.test.js]")}`, function() {
    it("testing create and get info access token function", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof accessToken.createNewAccessToken, "function");
        assert.strictEqual(typeof accessToken.getInfoFromAccessToken, "function");
        const sessionHandle = "sessionHandle";
        const userId = "testing";
        const refreshTokenHash1 = "refreshTokenHash1";
        const parentRefreshTokenHash1 = "parentRefreshTokenHash1";
        const userPayload = { a: "a" };
        const antiCsrfToken = "";
        const token = await accessToken.createNewAccessToken(
            sessionHandle,
            userId,
            refreshTokenHash1,
            antiCsrfToken,
            parentRefreshTokenHash1,
            userPayload
        );
        const infoFromToken = await accessToken.getInfoFromAccessToken(token.token);
        assert.deepStrictEqual(infoFromToken, {
            sessionHandle,
            userId,
            refreshTokenHash1,
            parentRefreshTokenHash1,
            userPayload,
            expiryTime: token.expiry,
            antiCsrfToken
        });
    });

    it("testing with custom signing key function", async function() {
        await reset(config.configWithSigningKeyFunction);
        const signingKey = await accessToken.getKeyForTesting();
        assert.deepStrictEqual(signingKey, config.configWithSigningKeyFunction.tokens.accessToken.signingKey.get());
    });

    it("testing very short update interval for signing key", async function() {
        await reset(config.configWithShortSigningKeyUpdateInterval);
        const signingKey1 = await accessToken.getKeyForTesting();
        await delay(2000);
        const signingKey2 = await accessToken.getKeyForTesting();
        assert.notDeepStrictEqual(signingKey1, signingKey2);
    });

    it("testing create and get info access token function (validity 1s)", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        assert.strictEqual(typeof accessToken.createNewAccessToken, "function");
        assert.strictEqual(typeof accessToken.getInfoFromAccessToken, "function");
        const sessionHandle = "sessionHandle";
        const userId = "testing";
        const refreshTokenHash1 = "refreshTokenHash1";
        const parentRefreshTokenHash1 = "parentRefreshTokenHash1";
        const userPayload = { a: "a" };
        const antiCsrfToken = "csrf";
        const token = await accessToken.createNewAccessToken(
            sessionHandle,
            userId,
            refreshTokenHash1,
            antiCsrfToken,
            parentRefreshTokenHash1,
            userPayload
        );
        await delay(1500);
        try {
            const infoFromToken = await accessToken.getInfoFromAccessToken(token.token);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
    });

    it("testing create and get info access token function (very short update interval for signing key)", async function() {
        await reset(config.configWithShortSigningKeyUpdateInterval);
        assert.strictEqual(typeof accessToken.createNewAccessToken, "function");
        assert.strictEqual(typeof accessToken.getInfoFromAccessToken, "function");
        const sessionHandle = "sessionHandle";
        const userId = "testing";
        const refreshTokenHash1 = "refreshTokenHash1";
        const parentRefreshTokenHash1 = "parentRefreshTokenHash1";
        const userPayload = { a: "a" };
        const antiCsrfToken = "csrf";
        const token = await accessToken.createNewAccessToken(
            sessionHandle,
            userId,
            refreshTokenHash1,
            antiCsrfToken,
            parentRefreshTokenHash1,
            userPayload
        );
        await delay(2000);
        try {
            const infoFromToken = await accessToken.getInfoFromAccessToken(token.token);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== errors.AuthError.TRY_REFRESH_TOKEN) {
                throw err;
            }
        }
    });
});
