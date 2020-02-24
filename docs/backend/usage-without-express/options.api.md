---
id: options-api
title: Handling Options API
sidebar_label: Handling Options API
---

<div class="specialNote">
This section is only applicable to web browser based apps.
</div>
<div style="height: 20px"></div>

The primary purpose of an ```Options``` API is to enable CORS.

## Set the following headers in the options API:
- ```Access-Control-Allow-Headers```: ```"anti-csrf"```
- ```Access-Control-Allow-Credentials```: ```true```
- ```Access-Control-Allow-Headers```: ```"supertokens-sdk-name"```
- ```Access-Control-Allow-Headers```: ```"supertokens-sdk-version"```

> You'll also need to add **"Access-Control-Allow-Credentials"** header with value **"true"** and **"Access-Control-Allow-Origin"** header to ***"YOUR_SUPPORTED_ORIGINS"*** for all the routes for which you'll be calling [`getSession`](./verify-session).