---
id: version-4.0.X-user-logout
title: User Logout
sidebar_label: User Logout
original_id: user-logout
---

- Logging out a user from a particular device can be done via revoking that user session using a ```sessionHandle```. 

- If you want to revoke all sessions belonging to a user, you will only need their ```userId```.

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
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

async function logoutAPI(req: express.Request, res: express.Response) {
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
        res.send("Go to login page");
    } catch (err) {
        // something went wrong.
    }
}

async function logoutAllSessionForUser(userId: string) {
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