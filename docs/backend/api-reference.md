---
id: api-reference
title: API Reference
sidebar_label: API Reference
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
##### Additional information
- Creates the MySQL tables if they don't already exist.
- Creates new signing keys if you do not provide one and they don't already exist. It synchronizes across all running instances of your node app to make sure all of them have the same keys.
- Parses and loads your provided config in memory.

<div class="divider"></div>

## ```createNewSession(res, userId, jwtPayload?, sessionData?)```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- ```res```
    - Type: ```Express.Response```
- ```userId```
    - Type: ```string | number```
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
##### Additional information
- Creates a new access and a new refresh token for this session.
- This function will set the following cookies and headers in the ```res``` object for you:
    - If ```enableAntiCsrf``` (in the ```config``` object) is set to ```true```, it sets ```anti-csrf``` header that contains an anti-csrf token. This header should be sent for all non-GET API calls that require authentication (except for the refresh session API). 
    - Sets ```sAccessToken``` in cookies with the access token. This cookie has ```HttpOnly``` set to ```true``` and ```secure``` set to ```true``` depending on your passed config. This cookie should be sent for all API calls that require authentication. 
    - Sets ```sRefreshToken``` in cookies containing the refresh token. This cookie has ```HttpOnly``` set to ```true``` and ```secure``` set to ```true``` depending on your passed config. <span class="highlighted-text">This cookie should be sent only to the refresh token API.</span>
    - Sets ```sIdRefreshToken``` in cookies containing a unique ID. Details for why this is needed can be found in the "How it works" section. This cookie has ```HttpOnly``` set to ```false``` and ```secure``` set to ```false```. This cookie should be sent for all API calls that require authentication. 
- Inserts a new row in the MySQL table for this new session.

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
    - If ```enableAntiCsrf``` (in the ```config``` object) is set to ```false```, this value will be considered as ```false``` even if value ```true``` is passed
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
    - This will be thrown if ```enableCsrfProtection``` is ```true```, ```enableAntiCsrf``` (in the ```config``` object) is set to ```true``` and ```anti-csrf``` token validation fails.
    - When this is thrown, none of the auth cookies are removed - you should return a ```session expired``` status code and instruct your frontend to call the refresh token API endpoint. Our frontend SDK takes care of this for you in most cases.
##### Additional information
- Verifies the current session using the ```req``` object.
- This function will mostly never require a database call since we are using JWT access tokens unless ```blacklisting``` is enabled.
- If ```enableCsrfProtection``` is ```true``` and ```enableAntiCsrf``` (in the ```config``` object) is set to ```true```, this function also provides CSRF protection. We strongly recommend that you set it to true for any non-GET API that requires user auth (except for the refresh session API).
- May change the access token - but this is taken care of by this function and our frontend SDK. You do need to worry about handling this.

<div class="divider"></div>

## ```session.getUserId()```
##### Important
- Use this only if you are importing from ```supertokens-node-mysql-ref-jwt/express```
##### Parameters
- none
##### Returns
- ```string | number``` - unique ID passed to the library when creating this session.
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
##### Additional information
- It does nothing to synchronize with other ```getSessionData``` or ```updateSessionData``` calls on this session. So it is up to you to handle various race conditions depending on your use case. 

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
##### Additional information
- It does nothing to synchronize with other ```getSessionData``` or ```updateSessionData``` calls on this session. So it is up to you to handle various race conditions depending on your use case. 

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
            userId: string | number
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
##### Additional information
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

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
##### Additional information
- It does nothing to synchronize with other getSessionData or updateSessionData calls on this ```sessionHandle```. So it is up to you to handle various race conditions depending on your use case.

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
##### Additional information
- This function deletes the session from the database
- If using blacklisting, this will immediately invalidate the JWT access token. If not, the user may still be able to continue using their access token to call authenticated APIs (until it expires).

<div class="divider"></div>

## ```revokeAllSessionsForUser(userId)```
##### Parameters
- ```userId```
    - Type: ```string | number```
##### Returns
- ```Promise<void>```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
##### Additional information
- This function deletes many sessions from the database. If it throws an error, then some sessions may already have been deleted.
- If using blacklisting, this will immediately invalidate the JWT access tokens associated with those sessions. If not, the user may still be able to continue using their access token to call authenticated APIs (until it expires).

<div class="divider"></div>

## ```createNewSession(userId, jwtPayload?, sessionData?)```
##### Parameters
- ```userId```
    - Type: ```string | number```
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
```ts
Promise<{
    session: {
        handle: string,
        userId: string | number,
        jwtPayload: any
    },
    accessToken: { value: string, expires: number },
    refreshToken: { value: string, expires: number },
    idRefreshToken: { value: string, expires: number },
    antiCsrfToken: string | undefined
}>
```
- ```antiCsrfToken``` will be ```undefined``` if ```enableAntiCsrf``` (in the ```config``` object) is set to ```false```.
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.
##### Additional information
- Creates a new access and a new refresh token for this session.
- Inserts a new row in the MySQL table for this new session.

<div class="divider"></div>

## ```getSession(accessToken, antiCsrfToken)```
##### Parameters
- ```accessToken```
    - Type: ```string```
- ```antiCsrfToken```
    - Type: ```string | null```
    - Pass ```null``` if you do not want to have CSRF protection for this auth call.
    - If ```enableAntiCsrf``` (in the ```config``` object) is set to ```false```, this value will be considered as ```null``` even if a ```string``` value is passed
##### Returns
```ts
Promise<{
    session: {
        handle: string,
        userId: string | number,
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
    - This will be thrown if ```enableAntiCsrf``` (in the ```config``` object) is set to ```true``` and ```antiCsrfToken``` validation fails.
    - When this is thrown, you should return a ```session expired``` status code and instruct your frontend to call the refresh token API endpoint. <span class="highlighted-text">Do not remove any auth cookie here</span> Our frontend SDK takes care of this for you in most cases.
##### Additional information
- This function will mostly never require a database call since we are using JWT access tokens unless ```blacklisting``` is enabled.
- Verifies the current session using input tokens.
- If ```antiCsrfToken``` is not ```null``` and ```enableAntiCsrf``` (in the ```config``` object) is set to ```true```, it also provides CSRF protection. We strongly recommend that you use this feature for all your non-GET APIs (except for the refresh session API).

<div class="divider"></div>

## ```refreshSession(refreshToken)```
##### Parameters
- ```refreshToken```
    - Type: ```string```
##### Returns
```ts
Promise<{
    session: {
        handle: string,
        userId: string | number,
        jwtPayload: any,
    },
    newAccessToken: { value: string, expires: number },
    newRefreshToken: { value: string, expires: number },
    newIdRefreshToken: { value: string, expires: number },
    newAntiCsrfToken: string | undefined
}>
```
- ```newAntiCsrfToken``` will be ```undefined``` if ```enableAntiCsrf``` (in the ```config``` object) is set to ```false```.
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
            userId: string | number
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
    - Type: ```string | number```
##### Returns
- ```Promise<string[]>```
    - Each element in the ```string[]``` is a ```sessionHandle```
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if the library could not connect to the MySQL instance.

<div class="divider"></div>

## ```setRelevantHeadersForOptionsAPI(res)```
##### Parameters
- ```res```
    - Type: ```Express.Response```
##### Returns
- nothing
##### Throws
- ```GENERAL_ERROR```
    - Type: ```{errType: SuperTokens.Error.GENERAL_ERROR, err: any}```
    - Examples of when this is thrown is if something went wrong while setting headers.