# The Dockerfile is a blueprint for creating a Docker image. It contains a set of instructions that Docker will execute one by one.

# Stage 1 - the build environment
################################################

FROM node:16.15.1-alpine3.14@sha256:889139aa824c8b9dd29938eecfd300d51fc2e984f9cd03df391bcfbe9cf10b53 AS build

LABEL maintainer="Samina Rahman Purba <srpurba@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci
################################################

# Stage 2 - the production environment
################################################

FROM node:16.15.1-alpine3.14@sha256:889139aa824c8b9dd29938eecfd300d51fc2e984f9cd03df391bcfbe9cf10b53 AS production

WORKDIR /app

COPY --from=build /app /app/
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

CMD ["npm", "start"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
   CMD curl --fail localhost:8080 || exit 1

################################################
