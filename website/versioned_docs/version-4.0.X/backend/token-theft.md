---
id: version-4.0.X-token-theft
title: Token Theft Detection
sidebar_label: Token Theft Detection
original_id: token-theft
---

- SuperTokens uses the concept of Rotating Refresh tokens to detect refresh token theft. Please see the [How it works](../how-it-works/details) section for more details.

- The ```refreshSession``` function will throw an error if it detects token theft (See "Refreshing Session" section). For quicker detection, keep the access token's lifetime small.

- Once detected, you get a reference to the ```userId``` whose session is hijacked and you get a reference to that session's ```sessionHandle``` (See [this](error-handling#unauthorised_and_token_theft_detected)). Using these two, you can either only revoke that session, or all sessions that belong to this user. Furthermore, you can go about doing anything else that you like - like notifying the user about this event.