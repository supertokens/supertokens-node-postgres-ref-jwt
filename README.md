![SuperTokens banner](https://raw.githubusercontent.com/supertokens/supertokens-logo/master/images/Artboard%20%E2%80%93%2027%402x.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/supertokens/supertokens-node-postgres-ref-jwt/blob/master/LICENSE)
<a href="https://supertokens.io/discord">
        <img src="https://img.shields.io/discord/603466164219281420.svg?logo=discord"
            alt="chat on Discord"></a>
[![Slack](https://img.shields.io/badge/slack-chat-brightgreen?logo=slack)](https://join.slack.com/t/webmobilesecurity/shared_invite/enQtODM4MDM2MTQ1MDYyLTFiNmNhYzRlNGNjODhkNjc5MDRlYTBmZTBiNjFhOTFhYjI1MTc3ZWI2ZjY3Y2M3ZjY1MGJhZmRiNDFjNDNjOTM)

**Master**
[![CircleCI](https://circleci.com/gh/supertokens/supertokens-node-postgres-ref-jwt.svg?style=svg)](https://circleci.com/gh/supertokens/supertokens-node-postgres-ref-jwt)
**Dev**
[![CircleCI](https://circleci.com/gh/supertokens/supertokens-node-postgres-ref-jwt/tree/dev.svg?style=svg)](https://circleci.com/gh/supertokens/supertokens-node-postgres-ref-jwt/tree/dev)


This library implements user session management for websites and apps that run on **NodeJS** and **PostgreSQL**. If you do not use these technologies, please checkout [our website](https://supertokens.io) to find the right library for you.

**The session protocol SuperTokens uses is described in detail in [this article](https://supertokens.io/blog/the-best-way-to-securely-manage-user-sessions).**

The library has the following features:
- It uses short-lived access tokens (JWT) and long-lived refresh tokens (Opaque).
- **Protects against**: XSS, Brute force, Session fixation, JWT signing key compromise, Data theft from database, CSRF and session hijacking.
- **Token theft detection**: SuperTokens is able to detect token theft in a robust manner. Please see the article mentioned above for details on how this works.
- **Complete auth token management** - It only stores the hashed version of refresh tokens in the database, so even if someone (an attacker or an employee) gets access to the table containing them, they would not be able to hijack any session.
- **Automatic JWT signing key generation** (if you don't provide one), management and **rotation** - Periodic changing of this key enables maximum security as you don't have to worry much in the event that this key is compromised. Also note that doing this change will not log any user out :grinning:
- **Complete cookie management** - Takes care of making them secure and HttpOnly. Also removes, adds and edits them whenever needed. You do not have to worry about cookies and its security anymore!
- **Efficient** in terms of **space complexity** - Needs to store just one row in a SQL table per logged in user per device.
- **Efficient** in terms of **time complexity** - Minimises the number of DB lookups (most requests do not need a database call to authenticate at all if blacklisting is false - which is the default)
- Built-in support for **handling multiple devices per user**.
- **Built-in synchronisation** in case you are running multiple node processes.
- **Easy to use** (see [auth-demo](https://github.com/supertokens/auth-demo)), with well documented, modularised code and helpful error messages!
- Using this library, you can keep a user logged in for however long you want - without worrying about any security consequences. 

## Free one-to-one implementation support
- Schedule a short call with us on https://calendly.com/supertokens-rishabh.

## Index
- [Documentation](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#documentation)
- [Making changes](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#making-changes)
- [Tests](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#tests)
- [Future work](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#future-work)
- [Support, questions and bugs](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#support-questions-and-bugs)
- [Authors](https://github.com/supertokens/supertokens-node-postgres-ref-jwt#authors)

## Documentation: 
Please see our [Documentation website](https://supertokens.github.io/supertokens-node-postgres-ref-jwt/)

## Making changes
Please see our [Contributing](https://github.com/supertokens/supertokens-node-postgres-ref-jwt/blob/master/CONTRIBUTING.md) guide

## Tests
To test this library, you need Node and PostgreSQL running on your system.
```bash
npm install -d
npm test
```
See our [Contributing](https://github.com/supertokens/supertokens-node-postgres-ref-jwt/blob/master/CONTRIBUTING.md) guide for more information.

## Future work
- Enable this to work with mobile apps as well.
- To implement info, debug and error logs in a better way.
- Add scaling metrics
- IP change detection invalidates access token, so that thefts get caught sooner, or attacker get's logged out, while keeping the actual user logged in (Thanks to [Aervue](https://github.com/Aervue))

## Support, questions and bugs
We are most accessible via team@supertokens.io, via the GitHub issues feature and our [Discord server](https://supertokens.io/discord). 

We realise that our community is small at the moment and therefore we will actively provide support to anyone interested in this library.

General support includes the following (freely available from us forever):
- Fixing bugs and catering to issues that apply to most users of this library.
- Keeping docs and the code up to date.
- Answering questions that apply to most users via Stack Overflow, Email, Quora etc.
- Expanding the feature set of this library in a way that is helpful to most users.
- Catering to pull requests.

Dedicated support includes the following:
- Help in a custom implementation of this library into your existing project/infrastructure.
- Implementation of custom flows or features for your session management needs.
- Consultation on your current session management system - help you improve it, identify and fix vulnerabilities, and suggest the best solution for you given your business requirements.
- Very high availability.

To show some love to our early adopters, we’re offering to give them a discount on our dedicated support on a case to case basis.

## Authors
Created with :heart: by the folks at SuperTokens. We are a startup passionate about security and solving software challenges in a way that's helpful for everyone! Please feel free to give us feedback at team@supertokens.io, until our website is ready :grinning:
