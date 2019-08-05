---
id: version-4.0.X-next-steps
title: Next Steps
sidebar_label: Next Steps
original_id: next-steps
---

To implement SuperTokens, please install and use our frontend and backend libraries found in the subsequent sections.

## What does the backend SDK do?
- Provides a flexible and intuitive API to manage sessions.
- Manages the database in the context of sessions.
- Various session related processes like creating, destroying or refreshing sessions.
- Handling multiple concurrent requests - process synchronization and race condition handling.

## What does the frontend SDK do?
- Provides a wrapper around http, to make calls to your server end points that require authentication.
- Manages storage of access and refresh tokens.
- When you call an API but your access token has expired, it silently calls your refresh token endpoint to get a new access token and then recalls your original API to give you back the expected result.
- Synchronizes calls to the refresh token API to prevent <a href="https://supertokens.io/blog/the-best-way-to-securely-manage-user-sessions#e81c" target="_blank">this race condition</a>

## Already have your own session management implemented?
Please see our [Migration](../migration/backend) guide.