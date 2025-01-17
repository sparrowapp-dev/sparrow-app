# Stage 1: Build
FROM node:20.8.1-alpine as builder

# Set the working directory
WORKDIR /app

ENV GENERATE_SOURCEMAP=false

# Copy root-level files
COPY package.json yarn.lock ./

# Copy packages folder
COPY packages ./packages

# Copy apps folder
COPY apps/@sparrow-storybook ./apps/@sparrow-storybook

# Install dependencies (using yarn to respect the workspace setup)
RUN yarn install --frozen-lockfile

# Build the web app
# WORKDIR /app/apps/@sparrow-storybook
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn storybook-build

# Stage 2: Serve
FROM nginx:alpine as runner

# Set working directory in Nginx
WORKDIR /usr/share/nginx/html

# Copy build output from builder stage
COPY --from=builder /app/apps/@sparrow-storybook/dist /usr/share/nginx/html

COPY ./apps/@sparrow-storybook/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]