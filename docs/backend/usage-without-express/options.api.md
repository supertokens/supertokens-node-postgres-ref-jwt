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