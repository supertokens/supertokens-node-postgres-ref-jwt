---
id: version-4.0.X-user-login
title: User login
sidebar_label: User login
original_id: user-login
---

## Call the ```createNewSession``` function: [API Reference](../api-reference#createnewsessionuserid-jwtpayload-sessiondata)
```js
SuperTokens.createNewSession(userId, jwtPayload, sessionData);
```
- Call this function after you have authenticated a user. Authentication can be done via any means: password, social logins, 2FA  etc.
- ```userId``` must be of type ```string```. If you want to use another datatype, then you have to create convertors for them from that datatype to a string. For example to use with ```number```:
  ```js
  let userId = 1; // is a number
  let session = await SuperTokens.createNewSession(userId + "", jwtPayload, sessionData); // we convert 1 to a string
  let userFromSession = Number(session.getUserId());
  ```
- This function does the following operations:
    - Creates a new access and a new refresh token for this session.
    - Inserts a new row in the MySQL table for this new session.
- This function will return the following tokens:
    - ```antiCsrfToken```
        - Set this in the header with the key ```anti-csrf```.
        - Our frontend SDK will store this in the localstorage (if you are using a webapp). This will then be automatically sent on each subsequent request for CSRF protection.
    - ```accessToken```
        - Set ```accessToken.value``` in the cookie with the key ```sAccessToken```. 
        - This cookie should have ```HttpOnly``` set to ```true``` and ```secure``` set to ```true``` unless you are in development / testing mode.
        - Set the ```expiry time``` of this cookie: ```expiry: new Date(accessToken.expires)```
        - The ```path``` of this cookie should cover all your APIs that require authentication. For example: ```/```
    - ```refreshToken```
        - Set ```refreshToken.value``` in the cookie with the key ```sRefreshToken```. 
        - This cookie should have ```HttpOnly``` set to ```true``` and ```secure``` set to ```true``` unless you are in development / testing mode.
        - Set the ```expiry time``` of this cookie: ```expiry: new Date(refreshToken.expires)```
        - <span class="highlighted-text">The ```path``` of this cookie should cover only your refresh session endpoint.</span> For example: ```/refreshsession```
    - ```idRefreshToken```
        - Set ```idRefreshToken.value``` in the cookie with the key ```sIdRefreshToken```. 
        - <span class="highlighted-text">This cookie should have ```HttpOnly``` set to ```false``` and ```secure``` set to ```false``` even in production.</span>
        - Set the ```expiry time``` of this cookie: ```expiry: new Date(idRefreshToken.expires)```
        - The ```path``` of this cookie should cover all your APIs that require authentication. For example: ```/```. 

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

function loginAPI() {
    // ...
    // assuming user has been authenticated somehow..
    let userId = "User1";
    let jwtPayload = {userId, name: "spooky action at a distance"};
    let sessionData = {awesomeThings: ["programming", "javascript", "SuperTokens"]};
    SuperTokens.createNewSession(userId, jwtPayload, sessionData).then(session => {

        let accessToken = session.accessToken;
        setCookie("sAccessToken", accessToken.value, "example.com", true, true, 
        new Date(accessToken.expires), "/");
        
        let refreshToken = session.refreshToken;
        setCookie("sRefreshToken", refreshToken.value, "example.com", true, true, 
        new Date(refreshToken.expires), "/refreshsession");
        
        let idRefreshToken = session.idRefreshToken;
        setCookie("sIdRefreshToken", idRefreshToken.value, "example.com", false, false, 
        new Date(idRefreshToken.expires), "/");

        let antiCsrfToken = session.antiCsrfToken;
        setHeader("anti-csrf", antiCsrfToken);

        // reply with success

    }).catch(err => {
        // session was not created. Handle error...
    });
}

function setCookie(key, value, domain, secure, httpOnly, expires, path) {
    // this will be specific to your framework...
}

function setHeader(key, value) {
    // this will be specific to your framework...
}
```