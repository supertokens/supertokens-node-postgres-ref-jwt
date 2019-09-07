const assert = require("assert");
const { printPath } = require("./utils");

const postgresCommonConfig = {
    config: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD === undefined ? "password" : process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB || "auth_session"
    },
    tables: {
        refreshTokens: "refresh_token_test",
        signingKey: "signing_key_test"
    }
};

module.exports.minConfigTest = {
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
    postgres: postgresCommonConfig,
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
