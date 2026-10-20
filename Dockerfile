# bonbon-web: build the static app, then ship it on Caddy, which also fronts the API (deploy/Caddyfile in the
# umbrella repo is mounted at runtime). Public, build-time settings only (never secrets):
# docker build -t bonbon-web --build-arg VITE_SITE_URL=https://example.vn --build-arg VITE_GOOGLE_CLIENT_ID=... .

FROM node:24-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_RECAPTCHA_SITE_KEY=""
ARG VITE_SITE_URL=""
ARG VITE_SUBDOMAINS=""
ARG VITE_API_URL=""
ARG VITE_SUPPORT_EMAIL=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_SUBDOMAINS=$VITE_SUBDOMAINS \
    VITE_API_URL=$VITE_API_URL \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /src/dist /srv
