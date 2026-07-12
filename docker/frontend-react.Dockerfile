# =========================================================
# Stage 1: Static assets compilation
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# =========================================================
# Stage 2: Nginx Web server deployment
# =========================================================
FROM nginx:1.25-alpine AS runner

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static directory from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
