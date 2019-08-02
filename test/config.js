const assert = require("assert");
const { printPath } = require("./utils");

const mysqlCommonConfig = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DB || "auth_session",
    tables: {
        refreshTokens: "refresh_token_test",
        signingKey: "signing_key_test"
    }
};

module.exports.minConfigTest = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            signingKey: {
                dynamic: false
            }
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.minConfigTestWithAntiCsrfDisabled = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: false,
        accessToken: {
            signingKey: {
                dynamic: false
            }
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.minConfigTestWithBlacklisting = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            signingKey: {
                dynamic: false
            },
            blacklisting: true
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.configWithSigningKeyFunction = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            signingKey: {
                get: () => {
                    return "testing";
                }
            }
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.configWithShortSigningKeyUpdateInterval = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            signingKey: {
                updateInterval: 0.0005
            }
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.configWithShortValidityForAccessToken = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            validity: 1,
            accessTokenPath: "/testing"
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.configWithShortValidityForAccessTokenAndAntiCsrfDisabled = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: false,
        accessToken: {
            validity: 1
        },
        refreshToken: {
            renewTokenPath: "/refresh"
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};

module.exports.configWithShortValidityForRefreshToken = {
    mysql: mysqlCommonConfig,
    tokens: {
        enableAntiCsrf: true,
        accessToken: {
            signingKey: {
                dynamic: false
            }
        },
        refreshToken: {
            renewTokenPath: "/refresh",
            validity: 0.0008
        }
    },
    cookie: {
        domain: "supertokens.io"
    }
};
