---
id: session-handle
title: Session Handle
sidebar_label: Session Handle
---

A ```sessionHandle``` is a unique ID for a session in your system. It stays the same during the entire lifetime a session - even though the actual access and refresh tokens keep changing.

## How do you get a ```sessionHandle```?
- If you are NOT using ```express```, the ```getSession``` function returns an object that contains this value.
- You can call the ```getAllSessionHandlesForUser``` function (see below)
- If token theft is detected, then the ```err``` object will contain a ```sessionHandle```.

## What can you do with a ```sessionHandle```?
- Revoke a session: See "User Logout" section.
- Update session information: See "Manipulating Session Data" section.

## Call the ```getAllSessionHandlesForUser``` function: [API Reference](api-reference#getallsessionhandlesforuseruserid)
```js
SuperTokens.getAllSessionHandlesForUser(userId);
```
- This function requires a database call.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';
// or import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

async function sessionHandleAPI() {
    let userId = "User1";
    SuperTokens.getAllSessionHandlesForUser(userId).then(sessionHandles => {
        sessionHandles.forEach(sessionHandle => {
            // do something with the current session
        });
    }).catch(err => {
        console.log("Oops! Something went wrong!");
    });
}
```