# ---- build ----------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Install deps first so the layer is reused whenever only source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `npm run build` typechecks before bundling, so a type error fails the image build.
RUN npm run build

# ---- serve ----------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 127.0.0.1, not localhost: that resolves to ::1 first in the container and nginx's
# `listen 80` binds IPv4 only, so the probe would be refused and the container
# would sit permanently unhealthy.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
