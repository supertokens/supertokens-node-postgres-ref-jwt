---
id: manipulating-session-data
title: Manipulating Session Data
sidebar_label: Manipulating Session Data
---

## There are two types of data you can store in a session:
- ```jwtPayload```
    - Once set, it cannot be changed further.
    - Should not contain any sensitive information since this is sent over to the client.
    - This is returned on a successful response of the ```getSession``` function call.
- ```sessionData```
    - This can be changed anytime during the lifetime of a session.
    - Can contain sensitive information since this is only stored in your database.
    - Requires a database call to read or write this information.
    - Reading or writing of this is not synchronized per session.

## Call the ```getSessionData``` function: [API Reference](../api-reference#getsessiondatasessionhandle)
```js
SuperTokens.getSessionData(sessionHandle);
```
- This function requires a database call each time it's called.

## Call the ```updateSessionData``` function: [API Reference](../api-reference#updatesessiondatasessionhandle-data)
```js
SuperTokens.updateSessionData(sessionHandle, newSessionData);
```
- This function overrides the current data stored for this ```sessionHandle```.
- This function requires a database call each time it's called.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

async function changeSessionDataAPI() {
    let session;
    try {
        let accessToken = //...
        let antiCsrfToken = //...
        let response = await SuperTokens.getSession(accessToken, antiCsrfToken);
        // .. check if received a new access token and handle that.
        session = response.session;
    } catch (err) {
        //...
    }
    try {

        // get JWT payload
        let jwtPayload = session.jwtPayload;

        // get session data from database
        let sessionData = await SuperTokens.getSessionData(session.handle);

        // overwrite current session data.
        await SuperTokens.updateSessionData(session.handle, {comment: "new session data"});
        // success!
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                // send 500 status code
            } else { // UNAUTHORISED
                clearAuthCookies();
                // redirect to user login.
            }
        } else {
            // send 500 status code
        }
    }
}

function clearAuthCookies() {
    // clear sAccessToken, sRefreshToken, sIdRefreshToken
}
```