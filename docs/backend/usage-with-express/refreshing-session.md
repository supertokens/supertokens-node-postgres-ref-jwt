---
id: refreshing-session
title: Refreshing Session
sidebar_label: Refreshing Session
---

This operation is to be done whenever any function returns the ```TRY_REFRESH_TOKEN``` error.

### The following are the steps that describe how this works:
- Your frontend calls an API (let's say ```/getHomeFeed```) with an access token that has expired.
- In that API, your backend calls the ```SuperTokens.getSession(req, res, enableCsrfProtection)``` function which throws a ```TRY_REFRESH_TOKEN``` error.
- Your backend replies with a session expired status code to your frontend.
- Your frontend detects this status code and calls an API on your backend that will refresh the session (let's call this API ```/api/refresh```).
- In this API, you call the ```SuperTokens.refreshSession(req, res)``` function that "refreshes" the session. This will result in the generation of a new access and a new refresh token. The lifetime of these new tokens starts from the point when they were generated (Please contact us if this is unclear).
- Your frontend then calls the ```/getHomeFeed``` API once again with the new access token yielding a successful response.

Our frontend SDK takes care of calling your refresh session endpoint and managing the auth tokens on your frontend.

<div class="specialNote">
If you are building a webapp and get a <code>TRY_REFRESH_TOKEN</code> error on your backend for a <code>GET</code> request that returns <code>HTML</code>, then you should reply with  <code>HTML & JS</code> code that calls your <code>/api/refresh</code> endpoint. Once that is successful, your frontend code should redirect the browser to call again the original <code>GET</code> API. More details on this in the frontend section.
</div>

## Call the ```refreshSession``` function: [API Reference](../api-reference#refreshsessionreq-res)
```js
SuperTokens.refreshSession(req, res);
```
- Refreshes the session by generating new access and new refresh tokens.
- If token theft is detected, then it throws a special ```UNAUTHORISED_AND_TOKEN_THEFT_DETECTED``` error. Using this error object, you can see who the affected user is and can choose to revoke their affected session.
- <span class="highlighted-text">This function should only be called in a special ```POST``` API endpoint whose only job is to refresh the session.</span> The path to this API will have to be given in the [Configurations](initialisation#configurations) ```(renewTokenPath)``` so that the refresh token cookie path can be set correctly.

<div class="divider"></div>

## Example code
```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

app.post("/api/refresh", function (req, res) {
    SuperTokens.refreshSession(req, res).then(session => {
        // on success
        res.send("Successful refreshing of session!");
    }).catch(err => {
        // on error
        if (SuperTokens.Error.isErrorFromAuth(err)) {   // we check that this error is indeed from our lib or not. Just to be safe.
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                res.status(500).send("Something went wrong");
            } else if (err.errType === SuperTokens.Error.UNAUTHORISED) {
                res.status(440).send("Session expired. Please login again!");
            } else {    // UNAUTHORISED_AND_TOKEN_THEFT_DETECTED
                // we have detected token theft! 
                // redirect user to login page
                res.status(440).send("Session expired. Please login again!");

                // get the affected user details
                let userId = err.err.userId;
                let sessionHandle = err.err.sessionHandle;
                // we can now revoke this session or all sessions belonging to this user.
                // we can also alert this user if needed.
            }
        } else {
            res.status(500).send(err);  // Something went wrong.
        }
    });
});
```