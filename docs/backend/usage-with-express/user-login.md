---
id: user-login
title: User login
sidebar_label: User login
---
To login a user, you must first authenticate their credentials and then create a session for them so that they can access your APIs.

## Call the ```createNewSession``` function: [API Reference](../api-reference#createnewsessionres-userid-jwtpayload-sessiondata)
```js
SuperTokens.createNewSession(res, userId, jwtPayload, sessionData);
```
- Call this function after you have verified the user credentials.
- This will override any existing session that exists in the ```res``` object with a new session.
- ```jwtPayload``` should not contain any sensitive information.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

app.post("/login", function (req, res) {
    // check for user credentials..
    let userId = "User1";
    let jwtPayload = {userId, name: "spooky action at a distance"};
    let sessionData = {awesomeThings: ["programming", "javascript", "SuperTokens"]};

    SuperTokens.createNewSession(res, userId, jwtPayload, sessionData).then(session => {
        res.send("Session created successfully!");
    }).catch(err => {
        // This will be of type GENERAL_ERROR (See error handling section).
        // Handle error by retrying, or sending the user a 500 status code.
    });
});
```