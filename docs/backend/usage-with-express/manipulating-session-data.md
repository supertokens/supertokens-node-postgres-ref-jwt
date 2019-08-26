---
id: manipulating-session-data
title: Manipulating Session Data
sidebar_label: Manipulating Session Data
---

## There are two types of data you can store in a session:
- ```jwtPayload```
    - Once set, it cannot be changed further.
    - Should not contain any sensitive information since this is sent over to the client.
    - Once you have a ```Session``` object, fetching the ```jwtPayload``` does not require any database calls.
- ```sessionInfo```
    - This can be changed anytime during the lifetime of a session.
    - Can contain sensitive information since this is only stored in your database.
    - Requires a database call to read or write this information.
    - Fetching or modification of this is not synchronized per session.

## If you have a session object
Please see the [Session Object](session-object#call-the-getsessioninfo-function-api-reference-api-reference-sessiongetsessioninfo) section for more information.

## If you do not have a session object
<div class="specialNote">
These functions should only be used if absolutely necessary, since they do not handle cookies for you. So if you are able to get a <code>Session</code> object AND have not already sent a reply to the client, please use the functions from the above section instead.
</div>

### Call the ```getSessionInfo``` function: [API Reference](../api-reference#getsessioninfosessionhandle)
```js
SuperTokens.getSessionInfo(sessionHandle);
```
- This function requires a database call each time it's called.

### Call the ```updateSessionInfo``` function: [API Reference](../api-reference#updatesessioninfosessionhandle-info)
```js
SuperTokens.updateSessionInfo(sessionHandle, newSessionInfo);
```
- This function overrides the current session info stored for this ```sessionHandle```.
- This function requires a database call each time it's called.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-postgres-ref-jwt/express';

async function changeSessionInfoAPI(req, res) {
    // first we get the session object
    let session;
    try {
        session = await SuperTokens.getSession(req, res, true);
    } catch (err) {
        //...
        return;
    }
    try {
        let jwtPayload = session.getJWTPayload();
        let sessionInfo = await session.getSessionInfo();
        await session.updateSessionInfo({comment: "new session info"});
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

async function changeSessionDataWithSessionObject(sessionHandle) {
    try {
        let sessionData = await SuperTokens.getSessionData(sessionHandle);
        await SuperTokens.updateSessionData(sessionHandle, {comment: "new session data"});
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                console.log("Something went wrong. Error from SuperTokens lib");
            } else { // UNAUTHORISED
                console.log("Session expired.");
            }
        } else {
            console.log("Something went wrong - error from somewhere else.");
        }
    }
}
```