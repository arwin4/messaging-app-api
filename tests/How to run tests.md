Use the Postman CLI like:

`postman collection run --env-var "domain=DOMAIN" tests/COLLECTION --env-var "JWT=TOKEN"`

The username of the test user is 'test-run'.

When running locally, the domain will be `http://localhost:3000`. The JWT expires after 24 hours. Get a new one by running the 'Create user' request.

#### Example:

`postman collection run --env-var "domain=http://localhost:3000" tests/Users.postman_collection.json --env-var "JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtcnVuIiwiaWF0IjoxNzA1MzEyMDE3LCJleHAiOjE3MDUzOTg0MTd9.DmZaVITxIDfs4AdvNC9zb1COd-JEqPlDqFb6iYpGkSE"`
