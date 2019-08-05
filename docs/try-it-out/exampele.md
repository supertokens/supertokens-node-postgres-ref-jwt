---
id: example
title: Example code and Demo
sidebar_label: Example code and Demo
---

You can check out the <a href="https://github.com/supertokens/auth-demo" target="_blank" class="highlighted-link">sample project</a> as an example for how to use the frontend and backend SuperTokens libraries.

We have created a live demo to show how SuperTokens helps prevent session theft and how it behaves in the event of an attack. You can interact with the demo on <a href="https://github.com/supertokens/auth-demo" target="_blank" class="highlighted-link">http://demo.supertokens.io</a>

<div class="specialNote">
This demo only works on Mozilla Firefox.
</div>
<br/>

The demo is split into 2 phases, one where you are a victim and another where you are an attacker.


As an innocent victim:
- Open the demo in a non-private window in firefox.
- Log in
- Right click anywhere inside the window and select 'Inspect Element'.
- Navigate to the Storage Section
- Find the cookies associated with <span class="highlighted-text">demo.supertokens.io</span>
- Copy the value of the cookie with the name <span class="highlighted-text">sRefreshToken</span>

As an attacker
- Open <a class="highlighted-text" style="text-decoration: none">http://demo.supertokens.io/attack</a> in a <span class="highlighted-text">private</span> window.
- Right click and select "Inspect Element"
- Navigate to the Storage section
- Find the cookies associated with <span class="highlighted-text">demo.supertokens.io</span>
- Paste the value you copied as an innocent victim against the cookie with the name <span class="highlighted-text">sRefreshToken</span>
- You have now hijacked the vitim's session, wait to see what happens

