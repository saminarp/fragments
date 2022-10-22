# The Dockerfile is a blueprint for creating a Docker image. It contains a set of instructions that Docker will execute one by one.


##### Stage 1 - the build environment #####
FROM node:16.15.1-alpine3.15 AS build

LABEL maintainer="Samina Rahman Purba <srpurba@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


######## Stage 2 - the production environment ########

FROM node:16.15.1-alpine3.15

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app /app/

COPY package.json package-lock.json ./

RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
