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
    - Once you have a ```Session``` object, fetching this does not require any database calls.
- ```sessionData```
    - This can be changed anytime during the lifetime of a session.
    - Can contain sensitive information since this is only stored in your database.
    - Requires a database call to fetch or modify this information.
    - Fetching or modification of this is not synchronized per session.

## If you have a session object
Please see the [Session Object](session-object#call-the-getsessiondata-function-api-reference-api-reference-sessiongetsessiondata) section for more information.

## If you only have a ```sessionHandle```
<div class="specialNote">
These functions should only be used if absolutely necessary, since they do not handle cookies for you. So if you are able to get a <code>Session</code> object, please use the functions from the above section instead.
</div>

### Call the ```getSessionData``` function: [API Reference](../api-reference#getsessiondatasessionhandle)
```js
SuperTokens.getSessionData(sessionHandle);
```
- This function requires a database call each time it's called.
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

### Call the ```updateSessionData``` function: [API Reference](../api-reference#updatesessiondatasessionhandle-data)
```js
SuperTokens.updateSessionData(sessionHandle, newSessionData);
```
- This function overrides the current data stored for this ```sessionHandle```.
- This function requires a database call each time it's called.
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

async function changeSessionDataAPI(req: express.Request, res: express.Response) {
    let session;
    try {
        session = await SuperTokens.getSession(req, res, true);
    } catch (err) {
        //...
    }
    try {
        let jwtPayload = session.getJWTPayload();
        let sessionData = await session.getSessionData();
        await session.updateSessionData({comment: "new session data"});
        res.send("Success!");
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                res.status(500).send("Something went wrong");
            } else { // UNAUTHORISED
                res.status(440).send("Session expired!");
            }
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
    }
}

async function changeSessionDataViaSessionHandle(sessionHandle: string) {
    try {
        let sessionData = await SuperTokens.getSessionData(sessionHandle);
        await SuperTokens.updateSessionData(sessionHandle, {comment: "new session data"});
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                console.log("Something went wrong");
            } else { // UNAUTHORISED
                // if we have access to Express response object here, be sure to remove the auth cookies - mentioned in the User Login section
                console.log("Session expired");
            }
        }
        console.log("Something went wrong");
    }
}
```