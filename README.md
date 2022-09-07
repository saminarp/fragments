# Microservice

## Overview  

[Microservices](https://aws.amazon.com/microservices/) are a software architectural approach where software is made up of small independently working services and communicating through APIs. Each microservice focuses on solving a specific problem and can be developed, deployed, operated and scaled without affecting other services.

## Instructions on running the scripts in `package.json`

```bash
npm start # starts server in a normal environment
npm run dev # restarts the server with nodemon to reflect changes automatically 
npm run debug # uses nodemon with node inspector for debugging
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
