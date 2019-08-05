---
id: version-4.0.X-backend
title: Add SuperTokens to an existing system
sidebar_label: Backend
original_id: backend
---

### Install the SuperTokens package
You will first need to install our library and setup your project to work with it. Please visit the [installation](../backend/installation) section for a step by step guide.


### Middleware
If you use a middleware for authentication, you can replace that by creating your own middleware using SuperTokens. An example of how to do that would be:

```js
import * as SuperTokens from 'supertokens-node-mysql-ref-jwt/express';

async function superTokensMiddleware (req, res, next) {
    if ( /* current API is refresh token endpoint */) {
        next();
        return;
    }
    try {
        let session = await SuperTokens.getSession(req, res, true);
        req.superTokensSession = session;
        next();
    } catch (err) {
        if (SuperTokens.Error.isAuthError(err)) {
            if (err.errType === SuperTokens.Error.GENERAL_ERROR) {
                next(err);
            } else if (err.errType === SuperTokens.Error.UNAUTHORISED) {
                res.redirect("/login");
            } else {    // TRY_REFRESH_TOKEN
                res.status(440).send("Please call the refresh token endpoint");
            }
        } else {
            next(err);
        }
    }
}

app.use(superTokensMiddleware);

// other routes / middlewares
app.use(...);
```

### Without Middleware

If you do not use any middlewares for authentication you can simply use the functions provided by this package. For examples of how to do this please see the Backend Section or the <a href="https://github.com/supertokens/auth-demo" target="_blank" class="highlighted-link orange">sample project</a>

### Refresh Token Endpoint

You need to create a ```POST``` API endpoint for refreshing user sessions. For more information visit the refreshing session sections:
- [With Express](../backend/usage-with-express/refreshing-session)
- [Without Express](../backend/usage-without-express/refreshing-session)