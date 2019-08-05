---
id: version-4.0.X-jwt-key-rotation
title: JWT Signing key rotation
sidebar_label: JWT Signing key rotation
original_id: jwt-key-rotation
---

One bottleneck of using JWTs is that their security depends on keeping their private signing key a secret. If someone was to get access to this, they could change the contents of any JWT as per their will. 

For example, they could sign in to your application with their credentials, get their JWT access token, and then change the userId in it to some other user. This would result in them getting access to that user's account!

Hence it is very important to keep this key a secret. However, from a security point of view we know that it is impossible to guarantee that. If your signing key does get stolen, then the best next step would be to immediately replace it.

Changing the JWT signing key would immediately invalidate all existing JWTs. This would mean that if any user were to call any of your authentication API, they would fail to validate their identity. This would then result in a ```TRY_REFRESH_TOKEN``` error, which would then result in the users using their refresh token and getting a new access key signed by the new signing key. <span class="highlighted-text">Overall, your users would not notice any disruption, and your system would remain secure.</span>

One problem with the argument above is that it keeps your system secure only if you know that a key theft has occurred. It is very possible that you may not even realise that that has happened! Hence, we have a feature of <span class="highlighted-text">automatic JWT signing key rotation - if you let us manage your JWT signing key, we will keep changing it every fixed time period</span>. To set this time period, or entirely switch off this feature see the [Configurations](config) section.

<div class="specialNote">
If you decide to manually change the JWT key, it is best to then restart all your node processes so that they can all be in sync. It is OK even if you do not do this, but it may result in many more calls to your refresh session API.
</div>