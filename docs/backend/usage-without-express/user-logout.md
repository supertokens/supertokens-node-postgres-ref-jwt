---
id: user-logout
title: User Logout
sidebar_label: User Logout
---

- Logging out a user from a particular device can be done via revoking that user session using a ```sessionHandle```. 

- If you want to revoke all sessions belonging to a user, you will only need their ```userId```.

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
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

// -------------------------------------------------

async function logoutAPI() {
     // first we verify the session.
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
        let success = await SuperTokens.revokeSessionUsingSessionHandle(session.sessionHandle);
        if (success) {
            clearAuthCookies();
        } else {
            // either sessionHandle is invalid, or session was already removed.
        }
    } catch (err) {
        // something went wrong.
    }
}

// -------------------------------------------------

async function logoutAllSessionsForUser(userId: string) {
    try {
        await SuperTokens.revokeAllSessionsForUser(userId);
    } catch (err) {
        console.log("Something went wrong");
    }
}

function clearAuthCookies() {
    // clear sAccessToken, sRefreshToken, sIdRefreshToken
}
```