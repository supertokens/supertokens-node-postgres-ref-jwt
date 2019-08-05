---
id: version-4.0.X-manipulating-session-data
title: Manipulating Session Data
sidebar_label: Manipulating Session Data
original_id: manipulating-session-data
---

## There are two types of data you can store in a session:
- ```jwtPayload```
    - Once set, when creating a new session, it cannot be changed further.
    - Should not contain any sensitive information since this is sent over to the client.
    - This is returned on successful response of ```getSession``` function call.
- ```sessionData```
    - This can be changed anytime during the lifetime of a session.
    - Can contain sensitive information since this is only stored in your database.
    - Requires a database call to fetch or modify this information.
    - Fetching or modification of this is not synchronized per session.

## Call the ```getSessionData``` function: [API Reference](../api-reference#getsessiondatasessionhandle)
```js
SuperTokens.getSessionData(sessionHandle);
```
- This function requires a database call each time it's called.
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

## Call the ```updateSessionData``` function: [API Reference](../api-reference#updatesessiondatasessionhandle-data)
```js
SuperTokens.updateSessionData(sessionHandle, newSessionData);
```
- This function overrides the current data stored for this ```sessionHandle```.
- This function requires a database call each time it's called.
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

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
        let jwtPayload = session.jwtPayload;
        let sessionData = await SuperTokens.getSessionData(session.handle);
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