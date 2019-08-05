---
id: user-login
title: User login
sidebar_label: User login
---
To login a user, you must first authenticate their credentials and then create a session for them so that they can access your APIs.

## Call the ```createNewSession``` function: [API Reference](../api-reference#createnewsessionuserid-jwtpayload-sessiondata)
```js
SuperTokens.createNewSession(userId, jwtPayload, sessionData);
```
- Call this function after you have verified the user credentials.
- ```userId``` must be of type ```string``` or ```number```.
- ```jwtPayload``` should not contain any sensitive information.
- This function will return the following tokens:
    - ```antiCsrfToken``` (Set in response header) 
        - Key: ```anti-csrf```.
        - Value: ```antiCsrfToken```
        - Will be ```undefined``` if ```enableAntiCsrf``` in the ```config``` object is set to ```false```.
    - ```accessToken``` (Set in cookie)
        - Key: ```sAccessToken```
        - Value: ```accessToken.value```
        - ```HttpOnly```: ```true```
        - ```secure```: ```true``` (Unless in dev mode)
        - Expiry time: ```new Date(accessToken.expires)```
        - ```Path```: A value that covers all your API paths. For example ```"/"```
    - ```refreshToken```
        - Key: ```sRefreshToken```
        - Value: ```refreshToken.value```
        - ```HttpOnly```: ```true```
        - ```secure```: ```true``` (Unless in dev mode)
        - Expiry time: ```new Date(refreshToken.expires)```
        - ```Path```: Your refresh session API path. For example: ```"/api/refresh"```
    - ```idRefreshToken```
        - Key: ```sIdRefreshToken```
        - Value: ```idRefreshToken.value```
        - ```HttpOnly```: ```false```
        - ```secure```: ```false```
        - Expiry time: ```new Date(idRefreshToken.expires)```
        - ```Path```: Same as the ```sAccessToken``` path

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt';

function loginAPI() {
    // check for user credentials..
    let userId = "User1";
    let jwtPayload = {userId, name: "spooky action at a distance"};
    let sessionData = {awesomeThings: ["programming", "javascript", "SuperTokens"]};
    SuperTokens.createNewSession(userId, jwtPayload, sessionData).then(session => {

        let accessToken = session.accessToken;
        setCookie("sAccessToken", accessToken.value, "example.com", true, true, 
        new Date(accessToken.expires), "/");
        
        let refreshToken = session.refreshToken;
        setCookie("sRefreshToken", refreshToken.value, "example.com", true, true, 
        new Date(refreshToken.expires), "/api/refresh");
        
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