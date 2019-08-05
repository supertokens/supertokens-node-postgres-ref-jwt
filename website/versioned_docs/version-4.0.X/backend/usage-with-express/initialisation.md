---
id: version-4.0.X-initialisation
title: Initialisation & Imports
sidebar_label: Init & Imports
original_id: initialisation
---

## Importing
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';
import * as CookieParser from 'cookie-parser';
```

## Use the ```CookieParser``` middleware with ```Express```
<span class="highlighted-text">Please make sure to call this before any of your API routes</span>. Otherwise ```getSession``` function will not work.
```js
app.use(CookieParser());
```

## Call the ```init``` function: [API Reference](../api-reference#initconfig)
```js
SuperTokens.init(config);
```
- Visit the [Configurations](../config) page to see what configs can be passed.
- Call this function in the same place where you initialize your express server.
- This function does the following operations:
    - Creates the MySQL tables if they don't already exist.
    - Creates new signing keys if you do not provide one and they don't already exist. It synchronizes across all running instances of your node app to make sure all of them have the same keys.
    - Parses and loads your provided config in memory.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';
import * as CookieParser from 'cookie-parser';

let app = express();
app.use(CookieParser());
let config = {...};
SuperTokens.init(config).then(() => {
    app.use(...);
    let server = http.createServer(app);
    server.listen(8080, "0.0.0.0");
}).catch((err: any) => {
    console.log("Oops!! Something went wrong :(", err);
});
```