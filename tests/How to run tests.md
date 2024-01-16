General usage of the Postman CLI:

`postman collection run  tests/COLLECTION --env-var "domain=DOMAIN" --env-var "JWT=TOKEN"`

### Running the Auth collection and getting a JWT for the other collections

To test the routes needing authentication, you must first run the Auth collection. It prints a new JWT which you'll need to pass to the other tests.

To run the Auth collection, run the following in your terminal:

`postman collection tests/Auth.postman_collection.json --env-var-"domain=DOMAIN"`

When running locally, the domain will be `http://localhost:3000`.
The JWT expires after 24 hours, so you'll need to repeat this step after this time has passed, or the other collection runs will fail.

### Running the Users and Messages collections

You can now run the Users and Messages collections by passing the acquired JWT on the command line. For example:

`postman collection run tests/Users.postman_collection.json --env-var "domain=http://localhost:3000" --env-var "JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QtcnVuIiwiaWF0IjoxNzA1MzEyMDE3LCJleHAiOjE3MDUzOTg0MTd9.DmZaVITxIDfs4AdvNC9zb1COd-JEqPlDqFb6iYpGkSE"`

### Running the Rooms collection

The Rooms collection creates a room in the first request, then sets that room's ID as an environment variable. Therefore, it's not possible to pass a room ID as an environment variable beforehand.

Unfortunately, the Postman CLI does not support setting a temporary environment on local runs. Therefore, you must import the collection in the Postman GUI and use either its built-in Runner (which is subject to usage limits) or choose 'Automate runs via CLI' to use the Postman CLI with an API key. Note that you must still pass the environment variables mentioned above.
