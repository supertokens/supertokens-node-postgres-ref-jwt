---
id: version-4.0.X-api-reference
title: API Reference
sidebar_label: API Reference
original_id: api-reference
---

## ```init(config)```
##### Parameters
- ```config```
    - Type: ```object```. To see the fields in this object, visit the [Configurations](config) page 
##### Returns
- ```Promise<void>``` on successful initialization
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance, or if the ```config``` provided is invalid.

<div class="divider"></div>

## ```createNewSession(res, userId, jwtPayload?, sessionData?)```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- ```res```
    - Type: ```Express.Response```
- ```userId```
    - Type: ```string```
    - Should be used to ID a user in your system.
- ```jwtPayload``` (Optional)
    - Type: ```object | array | number | string | boolean | undefined | null``` 
    - This information is stored in the JWT sent to the frontend, so <span class="highlighted-text">it should not contain any sensitive information.</span>
    - Once set, it cannot be changed during the lifetime of a session.
- ```sessionData``` (Optional)
    - Type: ```object | array | number | string | boolean | undefined | null``` 
    - This information is stored only in your database, so <span class="highlighted-text">it can contain sensitive information if needed.</span>
    - This can be freely modified during the lifetime of a session. But we do not synchronize calls to modify this - you must take care of locks yourself.
##### Returns
- ```Promise<Session>``` on successful creation of a session
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

<div class="divider"></div>

## ```getSession(req, res, enableCsrfProtection)```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- ```req```
    - Type: ```Express.Request```
- ```res```
    - Type: ```Express.Response```
- ```enableCsrfProtection```
    - Type: ```boolean```
##### Returns
- ```Promise<Session>``` on successful verification of a session
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the ```idRefreshToken``` cookie is missing from the ```req``` object or if the session has been revoked.
    - When this is thrown, all the relevant auth cookies are cleared by this function call, so you can redirect the user to a login page.
- ```TRY_REFRESH_TOKEN```
    - Type: ```{errType: SuperTokens.Error.TRY_REFRESH_TOKEN, err: any}```
    - This will be thrown if JWT verification fails. This happens, for example, if the token has expired or the JWT signing key has changed.
    - This will be thrown if ```enableCsrfProtection``` is ```true``` and ```anti-csrf``` token validation fails.
    - When this is thrown, none of the auth cookies are removed - you should return a ```session expired``` status code and instruct your frontend to call the refresh token API endpoint. Our frontend SDK takes care of this for you in most cases.

<div class="divider"></div>

## ```session.getUserId()```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- none
##### Returns
- ```string``` - unique ID passed to the library when creating this session.
##### Throws
- nothing

<div class="divider"></div>

## ```session.getJWTPayload()```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- none
##### Returns
- ```object | array | number | string | boolean | undefined | null``` - Will be deeply equal to whatever was passed to the ```createNewSession``` function.
##### Throws
- nothing

<div class="divider"></div>

## ```session.revokeSession()```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- none
##### Returns
- ```Promise<void>```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

<div class="divider"></div>

## ```session.getSessionData()```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- none
##### Returns
- ```Promise<object | array | number | string | boolean | undefined | null>``` - The result of the resolved ```Promise``` will be deeply equal to whatever was passed to the ```createNewSession``` function.
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired.
    - When this is thrown, all the relevant auth cookies are cleared by this function call, so you can redirect the user to a login page.

<div class="divider"></div>

## ```session.updateSessionData(data)```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- ```data```
    - Type: ```object | array | number | string | boolean | undefined | null``` 
##### Returns
- ```Promise<void>```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired.
    - When this is thrown, all the relevant auth cookies are cleared by this function call, so you can redirect the user to a login page.

<div class="divider"></div>

## ```refreshSession(req, res)```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- ```req```
    - Type: ```Express.Request```
- ```res```
    - Type: ```Express.Response```
##### Returns
- ```Promise<Session>``` on successful refresh.
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired, or if the provided refresh token is invalid.
    - When this is thrown, all the relevant auth cookies are cleared by this function call, so you can redirect the user to a login page.
- ```UNAUTHORISED_AND_TOKEN_THEFT_DETECTED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED, err: {
            sessionHandle: string,
            userId: string
        }}```
    - This is thrown if token theft is detected.
    - When this is thrown, all the relevant auth cookies are cleared by this function call, so you can redirect the user to a login page.
    - Please see the token theft detection section for more information.

<div class="divider"></div>

## ```getSessionData(sessionHandle)```
##### Parameters
- ```sessionHandle```
    - Type: ```string```
    - Identifies a unique session in your system. Please see the Session Handle section for more information.
##### Returns
- ```Promise<object | array | number | string | boolean | undefined | null>``` - The result of the resolved ```Promise``` will be deeply equal to whatever was passed to the ```createNewSession``` function.
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired.
    - You must handle auth cookie management yourself here (if relevant). Please see the Error Handling section for more details.

<div class="divider"></div>

## ```updateSessionData(sessionHandle, data)```
##### Parameters
- ```sessionHandle```
    - Type: ```string```
    - Identifies a unique session in your system. Please see the Session Handle section for more information.
- ```data```
    - Type: ```object | array | number | string | boolean | undefined | null``` 
##### Returns
- ```Promise<void>```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired.
    - You must handle auth cookie management yourself here (if relevant). Please see the Error Handling section for more details.

<div class="divider"></div>

## ```revokeSessionUsingSessionHandle(sessionHandle)```
##### Parameters
- ```sessionHandle```
    - Type: ```string```
    - Identifies a unique session in your system. Please see the Session Handle section for more information. 
##### Returns
- ```Promise<boolean>```
    - Will be ```true``` if a row was removed from the MySQL table.
    - Will be ```false``` if either the ```sessionHandle``` is invalid, or the session had already been removed.
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

    <div class="divider"></div>

## ```revokeAllSessionsForUser(userId)```
##### Parameters
- ```userId```
    - Type: ```string```
##### Returns
- ```Promise<void>```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

<div class="divider"></div>

## ```createNewSession(userId, jwtPayload?, sessionData?)```
##### Parameters
- ```userId```
    - Type: ```string```
    - Should be used to ID a user in your system.
- ```jwtPayload``` (Optional)
    - Type: ```object | array | number | string | boolean | undefined | null``` 
    - This information is stored in the JWT sent to the frontend, so <span class="highlighted-text">it should not contain any sensitive information.</span>
    - Once set, it cannot be changed during the lifetime of a session.
- ```sessionData``` (Optional)
    - Type: ```object | array | number | string | boolean | undefined | null``` 
    - This information is stored only in your database, so <span class="highlighted-text">it can contain sensitive information if needed.</span>
    - This can be freely modified during the lifetime of a session. But we do not synchronize calls to modify this - you must take care of locks yourself.
##### Returns
```js
Promise<{
    session: {
        handle: string,
        userId: string,
        jwtPayload: any
    },
    accessToken: { value: string, expires: number },
    refreshToken: { value: string, expires: number },
    idRefreshToken: { value: string, expires: number },
    antiCsrfToken: string
}>
```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

<div class="divider"></div>

## ```getSession(accessToken, antiCsrfToken)```
##### Parameters
- ```accessToken```
    - Type: ```string```
- ```antiCsrfToken```
    - Type: ```string | null```
    - Pass ```null``` if you do not want to have CSRF protection for this auth call.
##### Returns
```js
Promise<{
    session: {
        handle: string,
        userId: string,
        jwtPayload: any
    };
    newAccessToken: { value: string, expires: number } | undefined;
}>
```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the session has been revoked.
    - When this is thrown, please be sure to remove all relevant auth cookies. See the Error Handling section for more information.
- ```TRY_REFRESH_TOKEN```
    - Type: ```{errType: SuperTokens.Error.TRY_REFRESH_TOKEN, err: any}```
    - This will be thrown if JWT verification fails. This happens, for example, if the token has expired or the JWT signing key has changed.
    - This will be thrown if ```antiCsrfToken``` validation fails.
    - When this is thrown, you should return a ```session expired``` status code and instruct your frontend to call the refresh token API endpoint. <span class="highlighted-text">Do not remove any auth cookie here</span> Our frontend SDK takes care of this for you in most cases.

<div class="divider"></div>

## ```refreshSession(refreshToken)```
##### Parameters
- ```refreshToken```
    - Type: ```string```
##### Returns
```js
Promise<{
    session: {
        handle: string,
        userId: string,
        jwtPayload: any,
    },
    newAccessToken: { value: string, expires: number },
    newRefreshToken: { value: string, expires: number },
    newIdRefreshToken: { value: string, expires: number },
    newAntiCsrfToken: string
}>
```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
- ```UNAUTHORISED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED, err: any}```
    - This is thrown if the current session was revoked or has expired, or if the provided refresh token is invalid.
    - When this is thrown, please be sure to remove all relevant auth cookies. See the Error Handling section for more information.
- ```UNAUTHORISED_AND_TOKEN_THEFT_DETECTED```
    - Type: ```{errType: SuperTokens.Error.UNAUTHORISED_AND_TOKEN_THEFT_DETECTED, err: {
            sessionHandle: string,
            userId: string
        }}```
    - This is thrown if token theft is detected.
    - When this is thrown, please be sure to remove all relevant auth cookies. See the Error Handling section for more information.
    - Please see the token theft detection section for more information.

<div class="divider"></div>

## ```isErrorFromAuth(err)```
##### Parameters
- ```err```
    - Type: ```any``` error object got from ```try catch``` block
##### Returns
- ```boolean```
##### Throws
- nothing

<div class="divider"></div>

## ```getAllSessionHandlesForUser(userId)```
##### Parameters
- ```userId```
    - Type: ```string```
##### Returns
- ```Promise<string[]>```
    - Each element in the ```string``` array is a ```sessionHandle```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.