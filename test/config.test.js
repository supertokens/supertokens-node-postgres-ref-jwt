const SuperTokens = require("..");
const config = require("./config");
const assert = require("assert");
const { reset } = require("../lib/build/helpers/utils");
const { checkIfSigningKeyTableExists, checkIfRefreshTokensTableExists } = require("../lib/build/helpers/mysql");
const { printPath } = require("./utils");

describe(`Config: ${printPath("[test/config.test.js]")}`, function() {
    before(async function() {
        await reset();
    });
    it("testing init with minimum required config", async function() {
        assert.strictEqual(typeof SuperTokens.init, "function");
        await SuperTokens.init(config.minConfigTest);
        await checkIfSigningKeyTableExists();
        await checkIfRefreshTokensTableExists();
    });

    it("testing if table signing key table is created", async function() {
        await SuperTokens.init(config.minConfigTest);
        const tableExists = await checkIfSigningKeyTableExists();
        assert.strictEqual(tableExists, true);
    });

    it("testing if table refresh token table is created", async function() {
        await SuperTokens.init(config.minConfigTest);
        const tableExists = await checkIfRefreshTokensTableExists();
        assert.strictEqual(tableExists, true);
    });
});
