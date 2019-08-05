---
id: limitations
title: Limitations
sidebar_label: Limitations
---

## Supertokens currently does not support multiple sub-domains

For example if you have two sub-domains A and B. And user John is logged into both domains.

If domain A refreshes the user tokens for John, domain B would not automatically get the new anti-CSRF token for John. And the next time John tries to access domain B your APIs would be unable to validate John's identity resulting in an authorization error.

<div class="specialNote">
This is because our library uses localstorage to keep track of the anti-CSRF token, and the localstorage for each domain is separate. That being said there are ways to solve this issue.
</div>
<br/>

## Supertokens currently supports only one instance of MySQL

A version that works with multiple instances of MySQL will be available in our [enterprise solution](https://supertokens.io/enterprise).