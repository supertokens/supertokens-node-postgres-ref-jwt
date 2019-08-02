const assert = require("assert");
const config = require("./config");
const refreshToken = require("../lib/build/refreshToken");
const { reset } = require("../lib/build/helpers/utils");
let SuperTokens = require("..");
const { printPath } = require("./utils");

describe(`Refresh Token: ${printPath("[test/refreshToken.test.js]")}`, function() {
    it("testing create and get info refresh token function", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof refreshToken.createNewRefreshToken, "function");
        assert.strictEqual(typeof refreshToken.getInfoFromRefreshToken, "function");
        const sessionHandle = "sessionHandle";
        const parentRefreshTokenHash1 = "parentRefreshTokenHash1";
        const userId = "superToken";
        const token = await refreshToken.createNewRefreshToken(sessionHandle, userId, parentRefreshTokenHash1);
        const infoFromToken = await refreshToken.getInfoFromRefreshToken(token.token);
        assert.deepStrictEqual(infoFromToken, { sessionHandle, userId, parentRefreshTokenHash1 });
    });

    it("testing create token and verification with different signing keys", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof refreshToken.createNewRefreshToken, "function");
        assert.strictEqual(typeof refreshToken.getInfoFromRefreshToken, "function");
        const sessionHandle = "sessionHandle";
        const parentRefreshTokenHash1 = "parentRefreshTokenHash1";
        const userId = "superToken";
        const token = await refreshToken.createNewRefreshToken(sessionHandle, userId, parentRefreshTokenHash1);
        await reset(config.minConfigTest); // changes refresh token in db
        try {
            const infoFromToken = await refreshToken.getInfoFromRefreshToken(token.token);
            throw Error("test failed");
        } catch (err) {
            if (err.errType !== SuperTokens.Error.UNAUTHORISED) {
                throw err;
            }
        }
    });
});
