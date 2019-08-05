---
id: verify-session
title: Verify Session
sidebar_label: Verify Session
---


## Call the ```getSession``` function: [API Reference](../api-reference#getsessionaccesstoken-anticsrftoken)
```js
SuperTokens.getSession(accessToken, antiCsrfToken);
```
- Use this function at the start of each API call to authenticate the user.
- ```accessToken``` can be obtained from the cookies with the key ```sAccessToken```. If this cookie is missing, then you should treat it as an error of type ```TRY_REFRESH_TOKEN```.
- ```antiCsrfToken``` can be obtained from the headers with the key ```anti-csrf```. If this is missing and you do not want CSRF protection,  pass ```null``` to this function. Otherwise treat this like a ```TRY_REFRESH_TOKEN``` error.
- If this function returns a ```newAccessToken```, update the access token cookies as mentioned in the [User login](user-login) section.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

function likeCommentAPI() {
    // extract accessToken and antiCsrfToken
    let accessToken = getCookieValue("sAccessToken");
    let antiCsrfToken = getHeaderValue("anti-csrf");
    if (accessToken === undefined || antiCsrfToken === undefined) {
        // access token has probably expired. Send session expired response.
        return;
    }

    SuperTokens.getSession(accessToken, antiCsrfToken).then(response => {
        if (response.newAccessToken !== undefined) {
            let newAccessToken = response.newAccessToken;
            setCookie("sAccessToken", newAccessToken.value, "example.com", true, true, 
            new Date(newAccessToken.expires), "/");
        }
        let userId = response.session.userId;
        // rest of API logic...
    }).catch(err => {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                // send status code 500
            } else if (err.errType === SuperTokens.Error.UNAUTHORISED) {
                clearAuthCookies();
                // session has expired! You can redirect the user to a login page.
            } else {    // TRY_REFRESH_TOKEN
                // send session expired response. 
            }
        } else {
            // send status code 500
        }
    });
}

function clearAuthCookies() {
    // clear sAccessToken, sRefreshToken, sIdRefreshToken
}

function setCookie(key, value, domain, secure, httpOnly, expires, path) {
    // this will be specific to your framework...
}

function getCookieValue(key) {
    // this will be specific to your framework..
}

function getHeaderValue(key) {
    // this will be specific to your framework..
}
```
