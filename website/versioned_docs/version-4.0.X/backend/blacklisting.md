---
id: version-4.0.X-blacklisting
title: Blacklisting
sidebar_label: Blacklisting
original_id: blacklisting
---

- One fundamental property of ```JWT``` access tokens is that they are self contained. That means, they also contain information about when they will expire. This results in a limitation that you cannot revoke them on demand by simply changing the content in it (Since someone could simply use the older version of the JWT to bypass your change). As such, you need to maintain some state in your application to keep track of which ```JWTs``` have been revoked. This is known as blacklisting.

- By default blacklisting is disabled in the library since we expect you to use short lived access tokens anyway. This has the added advantage of not having to do a database query for almost all authentication calls.

- Due to the way we have implemented our system, enabling blacklisting does not take up any extra database space.

- We recommend that you enable this feature only if immediate revocation of access tokens is important. <span class="highlighted-text">To enable this feature, please see the [Configurations](config) section.</span>