---
id: version-4.0.X-initialisation
title: Initialisation & Imports
sidebar_label: Init & Imports
original_id: initialisation
---

## Importing
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';
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

<div class="specialNote">
We highly recommend that you create a wrapper around the provided APIs. This will make it much easier for you to do error handling in your API logic. For an example of how a wrapper would look like, please see our <a href="https://github.com/supertokens/supertokens-node-mysql-ref-jwt/blob/master/lib/ts/express.ts">Express wrapper</a>
</div>

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

let config = {...};
SuperTokens.init(config).then(() => {
    // setup your API routes
}).catch((err: any) => {
    console.log("Oops!! Something went wrong :(", err);
});
```