# ---- build ----------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Install deps first so the layer is reused whenever only source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked into the bundle at build time. Default is empty = same origin, which pairs with the
# `location /api/` proxy in nginx.conf; set it to an absolute URL to call the API cross-origin
# instead (the backend then needs CORS for this host).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# 1 = build an image that runs entirely on the demo fixtures: no API, no /api/ proxy, and a
# "Demo data" badge in the header so nobody mistakes it for the real thing. Anything else
# builds the normal image, which cannot be switched to fixtures at runtime.
ARG VITE_DEMO="0"
ENV VITE_DEMO=$VITE_DEMO

# `npm run build` typechecks before bundling, so a type error fails the image build.
RUN npm run build

# ---- serve ----------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# As a template, not a plain conf: the entrypoint runs envsubst over it at container start
# so API_ORIGIN can be set per-deployment without rebuilding the image. The FILTER is
# essential — without it envsubst would also replace $uri, $host, $scheme and so on.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER="^(API_ORIGIN|CSP_CONNECT_SRC|CSP_IMG_SRC)$"
ENV API_ORIGIN="http://host.docker.internal:8000"
ENV CSP_CONNECT_SRC="'self'"
# Club and court photos are served straight from Cloudinary, so the default CSP
# has to allow that origin or every uploaded image is blocked. `data:` stays for
# the demo fixtures, which draw their placeholder photos inline.
ENV CSP_IMG_SRC="'self' data: https://res.cloudinary.com"

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 127.0.0.1, not localhost: that resolves to ::1 first in the container and nginx's
# `listen 80` binds IPv4 only, so the probe would be refused and the container
# would sit permanently unhealthy.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
