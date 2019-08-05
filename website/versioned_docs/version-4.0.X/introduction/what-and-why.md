---
id: version-4.0.X-what-and-why
title: SuperTokens
sidebar_label: What and Why
original_id: what-and-why
---

<span class="highlighted-text">This library works with <b>NodeJS</b> and <b>MySQL</b>.</span> If you are using a different technology stack, please visit the [SuperTokens](https://supertokens.io#tech-stack) home page.

## What does this library do?
- This library implements the most secure session management flow that uses rotating refresh tokens to detect session theft. 
- It uses <span class="highlighted-text">Opaque refresh tokens</span> with <span class="highlighted-text">JWT access tokens</span>.
- Provides an end-to-end solution, handling everything from cookies / headers to your database.
- It has all the standard features you would expect from a session management solution.
- Well modularized, so you can use this as a base for your own solution if needed.


### Why is SuperTokens most secure?
We protect against all session related attacks and vulnerabilities:
- XSS
- Brute force
- CSRF
- Session fixation
- JWT signing key compromise
- Data theft from database
- Preventing session hijacking via <span class="highlighted-text">token theft detection</span>.

### How do we detect auth token theft?
- We use [rotating refresh tokens](https://tools.ietf.org/html/rfc6819#section-5.2.2.3) to detect if an older refresh token is being used when it should not be. 
- Our implementation does not have to explicitly store any old tokens, keeping space usage to a minimum.