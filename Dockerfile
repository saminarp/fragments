# The Dockerfile is a blueprint for creating a Docker image. It contains a set of instructions that Docker will execute one by one.

# Stage 1 - the build environment
################################################

FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS build

LABEL maintainer="Samina Rahman Purba <srpurba@myseneca.ca>"\
      description="Fragments node.js microservice"

ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production 
################################################

# Stage 2 - the production environment
################################################

FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS production

WORKDIR /app

COPY --from=build /app /app/
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

RUN apk --update --no-cache add curl=7.80.0-r4 \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

CMD ["npm", "start"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
   CMD curl --fail localhost:8080 || exit 1

################################################
