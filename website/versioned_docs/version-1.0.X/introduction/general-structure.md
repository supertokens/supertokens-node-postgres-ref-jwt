---
id: version-1.0.X-general-structure
title: General Flow
sidebar_label: General Flow
original_id: general-structure
---

Here is the general flow of session management that our library provides. A lot of these steps happen automatically if you use both our backend and frontend SDK.

### 1. Create a new session in your user login API
- This will create an access, an idRefresh and a refresh token for you.
- Send these tokens to the frontend. Our frontend SDK will store them for you automatically.

### 2. Send the access and idRefresh tokens for each API call
- Our frontend SDK will send these tokens automatically.

### 3. API session verification
- If the access token has not expired, your API will be able to successfully authenticate.
- If the access token has expired, your API should send an unauthorized error to your frontend.

### 4. Upon receiving an unauthorized error, your frontend should call your refresh token API with the refresh token
- This is handled automatically by our frontend SDK.

### 5. Your refresh token API then refreshes the session
- It generates new access, idRefresh and refresh tokens.
- Our frontend SDK will store these for you automatically
- Here is where token theft can detection occurs.

### 6. Go to step 2


