---
id: user-logout
title: User Logout
sidebar_label: User Logout
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
- <span class="highlighted-text">Does not clear any cookies</span>

## If you have a ```userId```
### Call the ```revokeAllSessionsForUser``` function: [API Reference](../api-reference#revokeallsessionsforuseruserid)
```js
SuperTokens.revokeAllSessionsForUser(userId);
```
- Use this to logout a user from all their devices.
- <span class="highlighted-text">Does not clear any cookies</span>

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

// example using Session object
app.use("/logout", function (req, res) {
    // first we verify the session.
    let session;
    try {
        session = await SuperTokens.getSession(req, res, true);
    } catch (err) {
        // See verify session page to handle errors here.
    }
    try {
        await session.revokeSession();
        res.send("Success! Go to login page");
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) { // GENERAL_ERROR
            res.status(500).send("Something went wrong");
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
    }
});

//----------------------------------------

// example using sessionHandle
async function logoutUsingSessionHandle(sessionHandle) {
    try {
        let success = await SuperTokens.revokeSessionUsingSessionHandle(sessionHandle);
        if (success) {
            // your code here..
        } else {
            // either sessionHandle is invalid, or session was already removed.
            // your code here..
        }
    } catch (err) {
        if (SuperTokens.Error.isErrorFromAuth(err)) { // GENERAL_ERROR
            console.log("Something went wrong from SuperTokens lib");
        } else {
            console.log("Something went wrong");
        }
    }
}

//----------------------------------------

// example using userId
async function logoutAllSessionForUser(userId) {
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