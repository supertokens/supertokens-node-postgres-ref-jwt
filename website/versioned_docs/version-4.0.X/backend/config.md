---
id: version-4.0.X-config
title: Configuration
sidebar_label: Configuration
original_id: config
---

This is an ```object``` that needs to be given as a parameter to the ```init``` function when your node server starts.

This object has the following shape:
```ts
// "?" means that parameter is optional
let config = {
    mysql: {
        host?: string,  // default localhost
        port?: number, // default 3306
        user: string, // If the tables in the database are not created already, then this user must have permission to create tables.
        password: string,
        connectionLimit?: number, // default 50
        database: string, // name of the database to connect to. This must be created before running this package
        tables?: {
            signingKey?: string, // default signing_key - table name used to store secret keys
            refreshTokens?: string // default refresh_token - table name used to store sessions
        }
    },
    tokens: {
        accessToken?: {
            signingKey?: {
                dynamic?: boolean, // default true - if this is true, then the JWT signing key will change automatically ever updateInterval hours (Unless you use the get function mentioned below).
                updateInterval?: number, // in hours - default 24 - should be >= 1 && <= 720. Determines how often to change the signing key. If dynamic is false, then this does not matter. 
                get?: () => Promise<string>, // default undefined - If you want to give your own JWT signing key, please give a function here. If this is given, then the dynamic boolean will be ignored as key management will be up to you. This function will be called every time we generate or verify any JWT, so please make sure it is efficient.
            },
            validity?: number, // in seconds, default is 3600 seconds. Should be >= 10 && <= 86400000 seconds. This determines the lifetime of an access token.
            blacklisting?: boolean // default is false. If you set this to true, revoking a session will cause immediate logout of the user using that session, regardless of access token's lifetime (Their access token will be invalidated). But know that this has an adverse effect on time efficiency of each getSession call.
        },
        refreshToken: {
            validity?: number, // in hours, default is 2400 (100 days). Should be >= 1 hour && <= 365 * 24 hours.  This determines how long a refresh token is alive for. So if your user is inactive for these many hours, they will be logged out.
            removalCronjobInterval?: string, // in the same style as of crontab, but with an extra seconds field as well. Default is "0 0 0 1-31/7 * *" - every 7th day of the month from 1 through 31. Defines how often the cronjob that removes expired sessions from the db should run.
            renewTokenPath: string // this is the API path that needs to be called for refreshing a session. This needs to be a POST API. An example value is "/api/refreshtoken". This will also be the path of the refresh token cookie.
        }
    },
    logging?: {
        info?: (info: any) => void, // default undefined. This function, if provided, will be called for info logging purposes
        error?: (err: any) => void // default undefined. This function, if provided, will be called for error logging purposes
    },
    cookie: {
        domain: string, // this is the domain to set for all the cookies. For example, "supertokens.io" The path for all cookies except the refresh token will be "/"
        secure?: boolean // default true. Sets if the cookies are secure or not. Ideally, this value should be true in production mode.
    }
}
```

To see how to use this object, please refer to the [Init & Imports](usage-with-express/initialisation#example-code) section.

## Development vs Production
- If your development mode does not support ```https```, please be sure to set the ```secure``` option to ```false```. Otherwise your access and refresh tokens will not be sent.
- In production, we highly recommend that you use ```https``` everywhere. In fact, you should redirect all ```http``` requests to use ```https``` as well!