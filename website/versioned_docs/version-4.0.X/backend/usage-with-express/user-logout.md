---
id: version-4.0.X-user-logout
title: User Logout
sidebar_label: User Logout
original_id: user-logout
---

- Logging out a user from a particular device can be done via revoking that user session - either via a ```Session``` object, or via a ```sessionHandle```. 

- If you want to revoke all sessions belonging to a user, you will only need their ```userId```.

<div class="specialNote">
If you can get the <code>Session</code> object, use that since revoking a session using that will also take care of clearing the cookies for you. 
</div>

## If you have a ```Session``` object
Please see the [Session Object](session-object#call-the-revokesession-function-api-reference-api-reference-sessionrevokesession) section for more information.

## If you have a ```sessionHandle```
### Call the ```revokeSessionUsingSessionHandle``` function: [API Reference](../api-reference#revokesessionusingsessionhandlesessionhandle)
```js
SuperTokens.revokeSessionUsingSessionHandle(sessionHandle);
```
- Use this to logout a user from their current session
- This function deletes the session from the database
- <span class="highlighted-text">Does not clear any cookies</span>
- If using blacklisting, this will immediately invalidate the JWT access token. If not, the user may still be able to continue using their access token to call authenticated APIs (until it expires).

## If you have a ```userId```
### Call the ```revokeAllSessionsForUser``` function: [API Reference](../api-reference#revokeallsessionsforuseruserid)
```js
SuperTokens.revokeAllSessionsForUser(userId);
```
- Use this to logout a user from all their devices.
- This function deletes many sessions from the database. If it throws an error, then some sessions may already have been deleted. 
- <span class="highlighted-text">Does not clear any cookies</span>
- If using blacklisting, this will immediately invalidate the JWT access tokens associated with those sessions. If not, the user may still be able to continue using their access token to call authenticated APIs (until it expires).

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

async function logoutAPI(req: express.Request, res: express.Response) {
    let session;
    try {
        session = await SuperTokens.getSession(req, res, true);
    } catch (err) {
        //...
    }
    try {
        await session.revokeSession();
        res.send("Go to login page");
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) { // GENERAL_ERROR
            res.status(500).send("Something went wrong");
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
    }
}

async function logoutUsingSessionHandle(sessionHandle: string) {
    try {
        let success = await SuperTokens.revokeSessionUsingSessionHandle(sessionHandle);
        if (success) {
            // deleted a MySQL row.
        } else {
            // either sessionHandle is invalid, or session was already removed.
        }
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) { // GENERAL_ERROR
            console.log("Something went wrong from SuperTokens lib");
        } else {
            console.log("Something went wrong");
        }
    }
}

async function logoutAllSessionForUser(userId: string) {
    try {
        await SuperTokens.revokeAllSessionsForUser(userId);
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) { // GENERAL_ERROR
            console.log("Something went wrong from SuperTokens lib");
        } else {
            console.log("Something went wrong");
        }
    }
}
```