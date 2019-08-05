---
id: database
title: Add SuperTokens to an exisiting Database
sidebar_label: Database
---

- SuperTokens will create two tables for you as mentioned [here](../backend/installation#3-optionally-create-tables-in-the-mysql-database). You can configure the database our library uses.  

- We recommend that you provide a new database for the following reasons:
  - You can more easily keep track of the data we generate.
  - Our library will have access only to that database and no other information stored in your MySQL instance.
  - Any future changes to the database will be easier for you to implement.