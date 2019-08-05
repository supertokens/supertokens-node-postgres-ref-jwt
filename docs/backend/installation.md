---
id: installation
title: Backend Installation
sidebar_label: Installation
---

### 1. Create a database in MySQL that will store session related information
This could either be existing app database or a new database.
```SQL
CREATE DATABASE DATABASE_NAME; # example name: auth_session
```

Note: We recommend that you create a new database as it would become easier for you to monitor the data our library stores.

### 2. Install SuperTokens package
```js
npm i --save supertokens-node-mysql-ref-jwt@^4.2.0
```

<div class="divider"></div>

<div class="additionalInformation" time="1">

<div class="specialNote">
For a complete solution, you will also need to use our frontend SDK along with our backend SDK. But you can go through that after you have setup your backend code.
</div>


### 3. Optionally create tables in the MySQL database
- If you do not create them, our library will create these two tables for you:
  ```SQL
  CREATE TABLE signing_key (
      key_name VARCHAR(128),
      key_value VARCHAR(255),
      created_at_time BIGINT UNSIGNED,
      PRIMARY KEY(key_name)
  );

  CREATE TABLE refresh_tokens (
      session_info TEXT,
      session_handle VARCHAR(255) NOT NULL,
      user_id VARCHAR(128) NOT NULL,
      refresh_token_hash_2 VARCHAR(128) NOT NULL,
      expires_at BIGINT UNSIGNED NOT NULL,
      jwt_user_payload TEXT,
      PRIMARY KEY(session_handle)
  );    
  ```
- Alternatively, you can create these two tables with different names (<span class="highlighted-text">keeping the column names and types the same</span>), and provide these names in the ```config``` object.

</div>