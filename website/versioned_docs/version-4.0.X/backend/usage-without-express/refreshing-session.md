---
id: version-4.0.X-refreshing-session
title: Refreshing Session
sidebar_label: Refreshing Session
original_id: refreshing-session
---

### The following are the steps that describe how this works:
- Your frontend calls an API (let's say ```/getHomeFeed```) with an access token that has expired.
- In that API, your backend calls the ```SuperTokens.getSession(accessToken, antiCsrfToken)``` function which throws a ```TRY_REFRESH_TOKEN``` error.
- Your backend replies with a ```session expired``` status code to your frontend.
- Your frontend detects this code and calls an API on your backend that will refresh the session (let's call this API ```/refreshSession```).
- In this API, you call the ```SuperTokens.refreshSession(refreshToken)``` function that "refreshes" the session. This will result in the generation of a new access and a new refresh token. The lifetime of these new tokens starts from the point when they were generated (Please contact us if this is unclear).
- Your frontend then calls the ```/getHomeFeed``` API once again with the new access token yielding a successful response.

Our frontend SDK takes care of calling your refresh endpoint and managing the auth tokens on your frontend. It also does a few more operations to handle race conditions when changing tokens.

<div class="specialNote">
If you are building a webapp and get a <code>TRY_REFRESH_TOKEN</code> error on your backend for a <code>GET</code> request that returns <code>HTML</code>, then you should reply with  <code>HTML & JS</code> code that calls your <code>/refreshSession</code> endpoint. Once that is successful, your frontend code should redirect the browser to call again the original <code>GET</code> API. More details on this in the frontend section.
</div>

## Call the ```refreshSession``` function: [API Reference](../api-reference#refreshsessionrefreshtoken)
```js
SuperTokens.refreshSession(refreshToken);
```
- Refreshes the session by generating new access and new refresh tokens.
- If token theft is detected, then it throws a special ```UNAUTHORISED_AND_TOKEN_THEFT_DETECTED``` error. Using this error object, you can see who the affected user is and can choose to revoke their affected session. Fore more information, please see the [Token theft detection](../token-theft) section along with the API reference.
- <span class="highlighted-text">This function should only be called in a special ```POST``` API endpoint whose job is to only refresh the session.</span>.
- This function will return a new set of auth and anti-csrf tokens. Please see the [User login](user-login) section or the example code below on how to use these tokens.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

// Should be a POST API
function refreshSessionAPI() {
    let refreshToken = getCookieValue("sRefreshToken");
    if (refreshToken === undefined) {
        clearAuthCookies();
        // redirect user to login page 
        return;
    }
    SuperTokens.refreshSession(refreshToken).then(response => {

        let accessToken = session.newAccessToken;
        setCookie("sAccessToken", accessToken.value, "example.com", true, true, 
        new Date(accessToken.expires), "/");
        
        let refreshToken = session.newRefreshToken;
        setCookie("sRefreshToken", refreshToken.value, "example.com", true, true, 
        new Date(refreshToken.expires), "/refreshsession");
        
        let idRefreshToken = session.newIdRefreshToken;
        setCookie("sIdRefreshToken", idRefreshToken.value, "example.com", false, false, 
        new Date(idRefreshToken.expires), "/");

        let antiCsrfToken = session.newAntiCsrfToken;
        setHeader("anti-csrf", antiCsrfToken);

        // reply with success.

    }).catch(err => {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                // reply with status code 500
            } else if (err.errType === SuperTokens.Error.UNAUTHORISED) {
                clearAuthCookies();
                // redirect user to login page
            } else {    // UNAUTHORISED_AND_TOKEN_THEFT_DETECTED
                // redirect user to login page
                clearAuthCookies();
                let userId = err.err.userId;
                let sessionHandle = err.err.sessionHandle;
                // we can now revoke this session or all sessions belonging to this user
                // we can also alert this user if needed...
            }
        } else {
            // reply with status code 500
        }
    });
}

function clearAuthCookies() {
    // clear sAccessToken, sRefreshToken, sIdRefreshToken
}

function getCookieValue(key) {
    // this will be specific to your framework..
}

function setCookie(key, value, domain, secure, httpOnly, expires, path) {
    // this will be specific to your framework...
}

function setHeader(key, value) {
    // this will be specific to your framework...
}
```