# Stage 1: Build
FROM node:20.8.1 AS builder

# Set the working directory
WORKDIR /app

# Copy files and build the web app
COPY package.json yarn.lock ./

# Copy packages folder
COPY packages ./packages

# Copy apps folder
COPY apps/@sparrow-web ./apps/@sparrow-web

# Install dependencies (using yarn to respect the workspace setup)
RUN yarn install --frozen-lockfile

# Build the web app
WORKDIR /app/apps/@sparrow-web
RUN yarn build

# Stage 2: Serve
FROM nginx:alpine AS runner

# Set working directory in Nginx
WORKDIR /usr/share/nginx/html

# Copy build output from builder stage
COPY --from=builder /app/apps/@sparrow-web/dist /usr/share/nginx/html

COPY ./apps/@sparrow-web/nginx.conf /etc/nginx/nginx.conf

# Create entrypoint directory if it doesn't exist
RUN mkdir -p /docker-entrypoint.d

# Copy and convert shell script to Unix format
COPY docker-entrypoint.d/10-runtime-rewrite.sh /docker-entrypoint.d/10-runtime-rewrite.sh

# Convert line endings to Unix format and make executable
RUN dos2unix /docker-entrypoint.d/10-runtime-rewrite.sh && \
    chmod +x /docker-entrypoint.d/10-runtime-rewrite.sh

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]