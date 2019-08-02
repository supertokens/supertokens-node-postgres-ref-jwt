const assert = require("assert");
const SuperTokens = require("../..");
const { reset, delay } = require("../../lib/build/helpers/utils");
const config = require("../config");
const supertest = require("supertest");
let app = require("./app");
const { printPath } = require("../utils");
const errors = require("../../lib/build/error");

const expiredCookie = "Expires=Thu, 01 Jan 1970 00:00:00 GMT";
const accessTokenPath = "Path=/testing;";
const refreshTokenPath = "Path=/refresh;";
describe(`SuperToken: ${printPath("[test/supertoken/supertoken.test.js]")}`, function() {
    it("create, get and refresh session (includes token theft and anti-csrf and cookie path testing)", async function() {
        await reset(config.configWithShortValidityForAccessToken);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie = undefined;
        let sRefreshTokenCookie = undefined;
        let sIdRefreshTokenCookie = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strictEqual(typeof antiCsrfHeader, "string");
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            console.log(sAccessTokenCookieFound, sRefreshTokenCookieFound, sIdRefreshTokenCookieFound);
            throw Error("");
        }
        /**
         * cookie path testing
         */
        if (
            !sAccessTokenCookie.includes(accessTokenPath) ||
            !sRefreshTokenCookie.includes(refreshTokenPath) ||
            !sIdRefreshTokenCookie.includes(accessTokenPath)
        ) {
            throw Error("cookie path not as expected");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);

        if (!response.body.success) {
            throw Error("test failed");
        }
        await delay(1500);
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (response.body.errCode !== errors.AuthError.TRY_REFRESH_TOKEN) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie, sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        antiCsrfHeader = response.headers["anti-csrf"];
        assert.strictEqual(typeof antiCsrfHeader, "string");
        assert.strictEqual(Array.isArray(cookies), true);
        let oldAccessTokenCookie = undefined;
        let oldRefreshTokenCookie = undefined;
        let oldIdRefreshTokenCookie = undefined;
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                if (cookies[i] === sAccessTokenCookie) {
                    throw Error("access token still same as last access token");
                }
                oldAccessTokenCookie = sAccessTokenCookie;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                if (cookies[i] === sRefreshTokenCookie) {
                    throw Error("refresh token still same as last refresh token");
                }
                oldRefreshTokenCookie = sRefreshTokenCookie;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                if (cookies[i] === sIdRefreshTokenCookie) {
                    throw Error("id refresh token still same as last id refresh token");
                }
                oldIdRefreshTokenCookie = sIdRefreshTokenCookie;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        if (response.body.errCode !== errors.AuthError.TRY_REFRESH_TOKEN) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [oldRefreshTokenCookie, oldAccessTokenCookie, oldIdRefreshTokenCookie])
            .expect(200);
        cookies = response.headers["set-cookie"];
        antiCsrfHeader = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(antiCsrfHeader === undefined, true); // since this is token theft. This header should not be there.
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (
                cookies[i].includes("sAccessToken=") &&
                cookies[i].includes(expiredCookie) &&
                cookies[i].includes(accessTokenPath)
            ) {
                sAccessTokenCookieFound = true;
            } else if (
                cookies[i].includes("sRefreshToken") &&
                cookies[i].includes(expiredCookie) &&
                cookies[i].includes(refreshTokenPath)
            ) {
                sRefreshTokenCookieFound = true;
            } else if (
                cookies[i].includes("sIdRefreshToken") &&
                cookies[i].includes(expiredCookie) &&
                cookies[i].includes(accessTokenPath)
            ) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED) {
            throw Error("test failed");
        }
    });

    it("create, get and refresh session (with anti-csrf disabled)", async function() {
        await reset(config.configWithShortValidityForAccessTokenAndAntiCsrfDisabled);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie = undefined;
        let sRefreshTokenCookie = undefined;
        let sIdRefreshTokenCookie = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.deepStrictEqual(antiCsrfHeader, undefined);
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);

        if (!response.body.success) {
            throw Error("test failed");
        }
        await delay(1500);
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        if (response.body.errCode !== errors.AuthError.TRY_REFRESH_TOKEN) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie, sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        antiCsrfHeader = response.headers["anti-csrf"];
        assert.deepStrictEqual(antiCsrfHeader, undefined);
        assert.strictEqual(Array.isArray(cookies), true);
        let oldAccessTokenCookie = undefined;
        let oldRefreshTokenCookie = undefined;
        let oldIdRefreshTokenCookie = undefined;
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                if (cookies[i] === sAccessTokenCookie) {
                    throw Error("access token still same as last access token");
                }
                oldAccessTokenCookie = sAccessTokenCookie;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                if (cookies[i] === sRefreshTokenCookie) {
                    throw Error("refresh token still same as last refresh token");
                }
                oldRefreshTokenCookie = sRefreshTokenCookie;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                if (cookies[i] === sIdRefreshTokenCookie) {
                    throw Error("id refresh token still same as last id refresh token");
                }
                oldIdRefreshTokenCookie = sIdRefreshTokenCookie;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }
    });

    it("revoke session (without blacklisting)", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie = undefined;
        let sRefreshTokenCookie = undefined;
        let sIdRefreshTokenCookie = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strict(typeof antiCsrfHeader, "string");
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/logout")
            .set("Cookie", [sRefreshTokenCookie, sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        cookies = response.headers["set-cookie"];
        let newAntiCsrfHeader = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(newAntiCsrfHeader === undefined, true);
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (!response.body.success) {
            throw Error("test failed");
        }

        // old access token still valid
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }
    });

    it("revoke session (with blacklisting)", async function() {
        await reset(config.minConfigTestWithBlacklisting);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie = undefined;
        let sRefreshTokenCookie = undefined;
        let sIdRefreshTokenCookie = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/logout")
            .set("Cookie", [sRefreshTokenCookie, sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        cookies = response.headers["set-cookie"];
        let newAntiCsrf = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(newAntiCsrf === undefined, true);
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (!response.body.success) {
            throw Error("test failed");
        }

        // old access token will be invalid
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }
    });

    it("refresh token expired", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie = undefined;
        let sRefreshTokenCookie = undefined;
        let sIdRefreshTokenCookie = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie, sIdRefreshTokenCookie])
            .set("anti-csrf", antiCsrfHeader)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        // this will remove refresh token from db
        await reset(config.minConfigTest);

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie, sAccessTokenCookie, sIdRefreshTokenCookie])
            .expect(200);
        cookies = response.headers["set-cookie"];
        antiCsrfHeader = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(antiCsrfHeader === undefined, true);
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }
    });

    it("revoke all session for user (without blacklisting)", async function() {
        await reset(config.minConfigTest);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie1 = undefined;
        let sRefreshTokenCookie1 = undefined;
        let sIdRefreshTokenCookie1 = undefined;
        let sAccessTokenCookie2 = undefined;
        let sRefreshTokenCookie2 = undefined;
        let sIdRefreshTokenCookie2 = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader1 = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie1 = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie1 = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie1 = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        cookies = response.headers["set-cookie"];
        let antiCsrfHeader2 = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie2 = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie2 = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie2 = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .set("anti-csrf", antiCsrfHeader2)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/revokeAll")
            .set("Cookie", [sRefreshTokenCookie1, sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie1, sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie2, sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }

        // old access tokens are still valid though
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .set("anti-csrf", antiCsrfHeader2)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }
    });

    it("revoke all session for user (with blacklisting)", async function() {
        await reset(config.minConfigTestWithBlacklisting);
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
        const userId = "testing";
        const jwtPayload = { a: "testing" };
        const sessionData = { s: "session" };
        let sAccessTokenCookie1 = undefined;
        let sRefreshTokenCookie1 = undefined;
        let sIdRefreshTokenCookie1 = undefined;
        let sAccessTokenCookie2 = undefined;
        let sRefreshTokenCookie2 = undefined;
        let sIdRefreshTokenCookie2 = undefined;

        // login | signup
        let response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        let cookies = response.headers["set-cookie"];
        let antiCsrfHeader1 = response.headers["anti-csrf"];
        let sAccessTokenCookieFound = false;
        let sRefreshTokenCookieFound = false;
        let sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie1 = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie1 = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie1 = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .post("/login")
            .send({
                userId,
                jwtPayload,
                sessionData
            })
            .expect(200);
        cookies = response.headers["set-cookie"];
        let antiCsrfHeader2 = response.headers["anti-csrf"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=")) {
                sAccessTokenCookieFound = true;
                sAccessTokenCookie2 = cookies[i];
            } else if (cookies[i].includes("sRefreshToken")) {
                sRefreshTokenCookieFound = true;
                sRefreshTokenCookie2 = cookies[i];
            } else if (cookies[i].includes("sIdRefreshToken")) {
                sIdRefreshTokenCookieFound = true;
                sIdRefreshTokenCookie2 = cookies[i];
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .set("anti-csrf", antiCsrfHeader2)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/revokeAll")
            .set("Cookie", [sRefreshTokenCookie1, sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (!response.body.success) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie1, sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .post("/refresh")
            .set("Cookie", [sRefreshTokenCookie2, sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .expect(200);
        cookies = response.headers["set-cookie"];
        sAccessTokenCookieFound = false;
        sRefreshTokenCookieFound = false;
        sIdRefreshTokenCookieFound = false;
        assert.strictEqual(Array.isArray(cookies), true);
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("sAccessToken=") && cookies[i].includes(expiredCookie)) {
                sAccessTokenCookieFound = true;
            } else if (cookies[i].includes("sRefreshToken") && cookies[i].includes(expiredCookie)) {
                sRefreshTokenCookieFound = true;
            } else if (cookies[i].includes("sIdRefreshToken") && cookies[i].includes(expiredCookie)) {
                sIdRefreshTokenCookieFound = true;
            }
        }
        if (!sAccessTokenCookieFound || !sRefreshTokenCookieFound || !sIdRefreshTokenCookieFound) {
            throw Error("");
        }
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }

        // old access tokens are now invalid because of blacklisting
        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie1, sIdRefreshTokenCookie1])
            .set("anti-csrf", antiCsrfHeader1)
            .expect(200);
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }

        response = await supertest(app)
            .get("/")
            .set("Cookie", [sAccessTokenCookie2, sIdRefreshTokenCookie2])
            .set("anti-csrf", antiCsrfHeader2)
            .expect(200);
        if (response.body.errCode !== errors.AuthError.UNAUTHORISED) {
            throw Error("test failed");
        }
    });
});
