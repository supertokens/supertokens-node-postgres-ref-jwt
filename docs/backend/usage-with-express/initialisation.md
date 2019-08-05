---
id: initialisation
title: Initialisation & Imports
sidebar_label: Init & Imports
---

## Importing
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';
```

## Call the ```init``` function: [API Reference](../api-reference#initconfig)
```js
SuperTokens.init(config);
```
- Call this function in the same place where you initialize your express server.

## Configurations
The config object has the following parameters (<span class="highlighted-text">The commented out parameters are optional</span>):
```ts
let config = {
    mysql: {
    //  host: "localhost",  // location of your MySQL instance.
    //  port: 3306,
        user: "root", // Change this to whichever user you want
        password: "root",
    //  connectionLimit: 50,
        database: "auth_session", // change this to your database name
    //  tables: {
    //      signingKey: "signing_key", // name of the table to store secrets.
    //      refreshTokens: "refresh_token" // name of the table to store session information.
    //  }
    },
    tokens: {
    //  accessToken: {
        //  signingKey: {
            //  dynamic: true, // if this is true, then the JWT signing key will change automatically every updateInterval hours.
            //  updateInterval: 24, // in hours - should be >= 1 && <= 720. Determines how often to change the signing key. If dynamic is false, then this does not matter. 
            //  get: undefined, // is a function of type: () => Promise<string> - If you want to give your own JWT signing key, please give a function here. If this is given, then the dynamic boolean will be ignored as key management will be up to you. This function will be called every time we generate or verify any JWT, so please make sure it is efficient.
        //  },
        //  validity: 3600, // in seconds. Should be >= 10 && <= 86400000 seconds. This determines the lifetime of an access token.
        //  blacklisting: false, // If you set this to true, revoking a session will cause immediate logout of the user using that session, regardless of access token's lifetime.
        //  accessTokenPath: "/" //This will be the path of the access token cookie.
    //  },
        refreshToken: {
        //  validity: 2400, // in hours. Should be >= 1 hour && <= 365 * 24 hours. This determines how long a refresh token is alive for.
        //  removalCronjobInterval: "0 0 0 1-31/7 * *", // in the same style as of crontab, but with an extra seconds field as well. Defines how often the cronjob that removes expired sessions from your db should run.
            renewTokenPath: string // this is the API path that needs to be called for refreshing a session. This needs to be a POST API. An example value is "/api/refreshtoken". This will also be the path of the refresh token cookie.
        },
    //  enableAntiCsrf: true // When set to true, you will also get CSRF attack protection. 
    },
//  logging: {
    //  info: undefined, // This function that has the following type: (info: any) => void. If provided, this will be called for info logging purposes
    //  error: undefined, // This function that has the following type: (err: any) => void. If provided, will be called for error logging purposes
//  },
    cookie: {
        domain: "your-domain-here.com", // this is the domain to set for all the cookies. If using a website, please make sure this domain is the common part of your website domain and your API domain. Do not set any port here and do not put http:// or https://
    //  secure: true // Sets if the cookies are secure or not. If you do not have https, make this false.
    }
}
```

<div class="divider"></div>

## Example code
```ts
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

let app = express();

// minimum config
let config = {
    mysql: {
        user: "root",
        password: "root",
        database: "auth_session",
    },
    tokens: {
        refreshToken: {
            renewTokenPath: "/api/refresh"
        },
    },
    cookie: {
        domain: "supertokens.io",
    }
};

SuperTokens.init(config).then(() => {
    app.get(...); // Setup your API routes here.
    app.post(...); // Setup your API routes here.
    let server = http.createServer(app);
    server.listen(8080, "0.0.0.0");
}).catch((err: any) => {
    console.log("Oops!! Something went wrong :(", err);
});
```

<div style="height: 10px"></div>
<div class="additionalInformation" time="1" text="See configuration type">
Below is the type of the <code>config</code> object for your reference:
<div style="height: 10px"></div>

```ts
// "?" means that parameter is optional
let config = {
    mysql: {
        host?: string,
        port?: number,
        user: string,
        password: string,
        connectionLimit?: number,
        database: string,
        tables?: {
            signingKey?: string,
            refreshTokens?: string
        }
    },
    tokens: {
        accessToken?: {
            signingKey?: {
                dynamic?: boolean,
                updateInterval?: number,
                get?: () => Promise<string>,
                accessTokenPath?: string
            },
            validity?: number,
            blacklisting?: boolean
        },
        refreshToken: {
            validity?: number,
            removalCronjobInterval?: string,
            renewTokenPath: string
        }
    },
    logging?: {
        info?: (info: any) => void,
        error?: (err: any) => void
    },
    cookie: {
        domain: string,
        secure?: boolean
    }
}
```

</div>