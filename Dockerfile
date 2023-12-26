FROM node:20-alpine3.18 AS base

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
RUN chown -R node:node /app

# BUILD # 

FROM base AS build

USER node

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

# PROD #

FROM base as production

USER node

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3000
EXPOSE 50051

ENTRYPOINT [ "node", "dist/main" ]
