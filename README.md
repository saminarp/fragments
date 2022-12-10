# Microservice

## Overview

[Microservices](https://aws.amazon.com/microservices/) are a software architectural approach where software is made up of small independently working services and communicating through APIs. Each microservice focuses on solving a specific problem and can be developed, deployed, operated and scaled without affecting other services.

A fragment is defined as any piece of text (e.g., `text/plain`, `text/markdown`, `text/html`, etc.), JSON data (`application/json`), or an image in any of the following formats:

| Name       | Type         | Extension |
| ---------- | ------------ | --------- |
| PNG Image  | `image/png`  | `.png`    |
| JPEG Image | `image/jpeg` | `.jpg`    |
| WebP Image | `image/webp` | `.webp`   |
| GIF Image  | `image/gif`  | `.gif`    |

## Environment Variables and testing

You can set the environment variables in the `.env` file.\
The `.env` file is not tracked by git, so you can set the environment variables in the `.env` file it should look like this;

```bash
# port to use when starting the server
PORT=8080

# AWS Amazon Cognito User Pool ID (use your User Pool ID)
#AWS_COGNITO_POOL_ID=your-user-pool-id

# AWS Amazon Cognito Client App ID (use your Client App ID)
#AWS_COGNITO_CLIENT_ID=your-client-app-id

API_URL=http://localhost:8080
#API_URL=http://ec2coEXAMPLE.amazonaws.com:8080/

HTPASSWD_FILE="tests/.htpasswd"
```

The AWS* credentials are not needed for local development. Since we are using Basic Auth for local development, the `HTPASSWD_FILE` is needed to be set. If you want to use the AWS* credentials, you need to create a User Pool and a Client App in AWS Cognito and set it like in the example shown.

After properly setting the environment variables, you can run the local development server by running `npm run dev`:

```bash
cd fragments && npm run dev
```

Youy can run the tests by running `npm run test`:

> **Note:** `npm run test` will run the tests in the `tests/unit` folder which was written using [Jest](https://jestjs.io/docs/en/getting-started). and supertest. If you run the command `npm run test:integration` it will run the tests in the `tests/integration` folder which was written using [hurl](https://hurl.dev/docs/installation.html).

Difference between unit and integration tests is that unit tests are testing the code in isolation and integration tests are testing the code in the context of the whole application.

### Dockerfile and Docker Compose for local development and testing

You can run the local development server by running `docker-compose up --build -d`:

This will build the docker image for localstack, fragments and dynamodb-local and run the containers in the background.
After this command you can run docker ps to see the running containers and their status.

```bash
❯ docker ps
CONTAINER ID   IMAGE                   COMMAND                  CREATED          STATUS                    PORTS                                             NAMES
cf5948dabd13   localstack/localstack   "docker-entrypoint.sh"   45 seconds ago   Up 43 seconds (healthy)   4510-4559/tcp, 5678/tcp, 0.0.0.0:4566->4566/tcp   fragments-localstack-1
2af70317a2be   fragments-fragments     "docker-entrypoint.s…"   45 seconds ago   Up 43 seconds (healthy)   0.0.0.0:8080->8080/tcp                            fragments-fragments-1
f4cf9fdca845   amazon/dynamodb-local   "java -jar DynamoDBL…"   45 seconds ago   Up 43 seconds             0.0.0.0:8000->8000/tcp                            fragments-dynamodb-local-1
```

After making sure that the containers are running, you should run the script file `./scripts/local-aws-setup.sh` to create the necessary resources in localstack and dynamodb-local (S3 Bucket and DynamoDB table). Give permission to the script file by running `chmod +x ./scripts/local-aws-setup.sh` and then run the script file by running `./scripts/local-aws-setup.sh`.

Note that this script uses the AWS CLI to create the resources in localstack and dynamodb-local. You can install the AWS CLI by following the instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).
After running the script file, you can run the tests by running `npm run test:integration`:

```bash
cd fragments && npm run test:integration
```

### Curl commands for testing the server endpoints

Regardless of the way you run the server (using docker-compose or development mode), you can use the following curl commands to test the endpoints. These curl commands lets you manage create, read, update and delete fragments.

### GET

```bash
curl -i -u user1@email.com:password1 \
"http://localhost:8080/v1/fragments/<FRAGMENT-ID>"
```

### POST

```bash
curl -s -u user1@email.com:password1 \
-H "Content-Type: text/markdown" \
-d "sample markdown fragment" -X POST localhost:8080/v1/fragments | jq
```

### Expand - get all fragments

```bash
curl -s -u user1@email.com:password1 \
"http://localhost:8080/v1/fragments?expand=1" | jq
```

### Get info

```bash
curl -s -u user1@email.com:password1 \
"http://localhost:8080/v1/fragments/<FRAGMENT-ID>/info" | jq
```

### PUT

```bash
curl -i \
  -X PUT \
  -u user1@email.com:password1 \
  -H "Content-Type: text/plain" \
  -d "This is updated data" \
 "http://localhost:8080/v1/fragments?expand=1/<FRAGMENT-ID>"
```

### Delete

```bash
curl -i -X DELETE -u user1@email.com:password1 \
"localhost:8080/v1/fragments/<FRAGMENT-ID>"
```

### ESLint & Prettier

[ESLint](https://eslint.org/docs/latest/user-guide/getting-started) and [Prettier](https://prettier.io/docs/en/options.html) is a development dependency which is not needed in production. These tools allow the code to be more consistent and helps in avoiding bugs by following patterns in ECMAScript/JavaScript code. Note: To configure format on save mode make sure you have the `.prettierrc` file.

```bash
npm run lint # for running lint
```

### node-inspector

To debug node script `npm run debug` uses the `--inspect` command.\
Node needs an attacher to run --inspect, configure this by clicking on the button `Auto Attach`.
Choose the option `with-flag`, this means, whenever you run the npm run debug it will recognize the flag and listen for node debugger.

### helmet

It protects the service from vulnerabilities consisting HTTP headers.
Helmet ensures the application is not leaking sensitive information in the headers.
