---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

## MySQL errors
#### Error: ```Client does not support authentication protocol```
- Run the following command in your MySQL monitor:
  ```SQL
  ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password'
  ```
    - Change the username from ```root``` to whatever you want.
    - Change the password from ```password``` to your actual password.

## Cookie errors
#### I cannot see any cookies in my browser
- Make sure you have set the correct domain for the cookies. For example, is your Website domain is ```example.com``` and your API domain is ```api.example.com```, then your cookie domain should be ```.example.com```
- Make sure the domain value given in the ```config``` object does not contain the port number.

#### The cookies are showing on my browser, but not getting sent to the APIs
- One reason could be that your cookie path does not cover your API path. For example, if your cookie path is ```/api```, then your API path must start with ```/api``` for it to receive that cookie.
- If you are not using ```HTTPS```, make sure to set the ```secure``` flag to ```false``` in the ```config``` object.

#### I cannot find the ```sRefreshToken``` cookie in my browser
- This usually happens in browsers like Google Chrome. They show cookies that apply only to the current loaded path. Try seeing the cookies in Mozilla Firefox, you will be able to see the refresh token cookie!

## CORS errors
#### Blocked by CORS policy: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true'
- This error occurs when your API domain is different than your website domain. Here, the difference could also be in the port number.
- To solve this error, add the following header to your response from your API: 
  ```
  Access-Control-Allow-Credentials: true
  ```