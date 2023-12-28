Use the Postman CLI like:

`postman collection run --env-var "domain=DOMAIN" tests/COLLECTION`

When running locally, the domain will be `http://localhost:3000`.

#### Example:

`postman collection run --env-var "domain=http://localhost:3000" tests/Users.postman_collection.json`
