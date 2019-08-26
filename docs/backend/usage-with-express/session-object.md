---
id: session-object
title: Session Object
sidebar_label: Session Object
---

A ```Session``` object is returned when a session is verified successfully. Following are the functions you can use on this ```session``` object:
```js
let session = await SuperTokens.getSession(req, res, enableCsrfProtection);
```
<div class="specialNote">
Please only use this session object if you have not sent a reply to the client yet.
</div>

## Call the ```getUserId``` function: [API Reference](../api-reference#sessiongetuserid)
```js
session.getUserId()
```
- This function does not do any database call.

## Call the ```getJWTPayload``` function: [API Reference](../api-reference#sessiongetjwtpayload)
```js
session.getJWTPayload()
```
- This function does not do any database call.
- It reads the payload available in the JWT access token that was used to verify this session.

## Call the ```revokeSession``` function: [API Reference](../api-reference#sessionrevokesession)
```js
session.revokeSession()
```
- Use this to logout a user from their current session.
- This function deletes the session from the database and clears relevant auth cookies
- If using ```blacklisting```, this will immediately invalidate the ```JWT``` access token. If not, the user may still be able to continue using their access token to call authenticated APIs (until it expires).

## Call the ```getSessionInfo``` function: [API Reference](../api-reference#sessiongetsessioninfo)
```js
session.getSessionInfo()
```
- This function requires a database call each time it's called.

## Call the ```updateSessionInfo``` function: [API Reference](../api-reference#sessionupdatesessioninfoinfo)
```js
session.updateSessionInfo(info)
```
- This function overrides the current session info stored for this session.
- This function requires a database call each time it's called.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-postgres-ref-jwt/express';

async function testSessionAPI(req: express.Request, res: express.Response) {
    
    // first we get the session object.
    let session = await SuperTokens.getSession(req, res, true);
    let userId = session.getUserId();
    let getJWTPayload = session.getJWTPayload();

    // update session info example
    try {
        let sessionInfo = await session.getSessionInfo();
        let newSessionInfo = {...sessionInfo, joke: "Knock, knock"};
        await session.updateSessionInfo(newSessionInfo);
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                res.status(500).send("Something went wrong");
            } else {    // UNAUTHORISED
                res.status(440).send("Session expired!");
            }
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
        return;
    }

    // revoking session example
    try {
        await session.revokeSession();
        // session has been destroyed.
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) {   // GENERAL_ERROR
            res.status(500).send("Something went wrong");
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
        return;
    }
    res.send("");
}
```
