const SuperTokens = require("../express");
const assert = require("assert");
const { printPath } = require("./utils");

describe(`User Functions: ${printPath("[test/index.test.js]")}`, function() {
    it("checking for init function", function() {
        assert.strictEqual(typeof SuperTokens.init, "function");
    });

    it("checking for Session class", function() {
        assert.strictEqual(typeof SuperTokens.Session, "function");
    });

    it("checking for createNewSession function", function() {
        assert.strictEqual(typeof SuperTokens.createNewSession, "function");
    });

    it("checking for getSession function", function() {
        assert.strictEqual(typeof SuperTokens.getSession, "function");
    });

    it("checking for refreshSession function", function() {
        assert.strictEqual(typeof SuperTokens.refreshSession, "function");
    });

    it("checking for revokeAllSessionsForUser function", function() {
        assert.strictEqual(typeof SuperTokens.revokeAllSessionsForUser, "function");
    });

    it("checking for revokeSessionUsingSessionHandle function", function() {
        assert.strictEqual(typeof SuperTokens.revokeSessionUsingSessionHandle, "function");
    });
});
