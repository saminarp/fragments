# The Dockerfile is a blueprint for creating a Docker image. It contains a set of instructions that Docker will execute one by one.

# Stage 1 - the build environment
################################################

FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS build

LABEL maintainer="Samina Rahman Purba <srpurba@myseneca.ca>"\
      description="Fragments node.js microservice"

# Set environment variables
ENV PORT=8080 \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

## Change ownership to node and copy package.json and package-lock.json
COPY --chown=node:node package.json package-lock.json /app/

# Install dependencies for production
RUN npm ci --only=production \
    && npm install sharp@0.30.7
################################################

# Stage 2 - the production environment
################################################
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS production

# Chande directory to /app
WORKDIR /app

# Change ownership to node (not root) and copy server's source code
COPY --chown=node:node --from=build /app/ ./
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

## Install curl to do health check
RUN apk --update --no-cache add curl=7.80.0-r4 \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Security optimizations
USER node

# Use node to run the server not npm 
CMD ["node", "./src/server.js"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
   CMD curl --fail localhost:8080 || exit 1

################################################
