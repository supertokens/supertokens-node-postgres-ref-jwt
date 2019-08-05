---
id: verify-session
title: Verify Session
sidebar_label: Verify Session
---

## Call the ```getSession``` function: [API Reference](../api-reference#getsessionreq-res-enablecsrfprotection)
```js
SuperTokens.getSession(req, res, enableCsrfProtection);
```
- Use this function at the start of each API call to authenticate the user. 
- You can either call the function directly in each API, or create a [middleware](../../migration/backend#middleware) out of it as per your requirements. 
- This will return a ```Session``` object. Please see the next section for information with what you can do with this.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

app.post("/like-comment", function (req, res) {
    SuperTokens.getSession(req, res, true).then(session => {
        let userId = session.getUserId();
        /*
         * rest of API logic...
         */ 
        res.send("Like successful :)");
    }).catch(err => {
        if (SuperTokens.Error.isErrorFromAuth(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                res.status(500).send("Something went wrong");
            } else if (err.errType === SuperTokens.Error.UNAUTHORISED) {
                res.status(440).send("Session expired! Please login again");
            } else {    // TRY_REFRESH_TOKEN
                res.status(440).send("Please call refresh token endpoint");
            }
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
    });
});
```
