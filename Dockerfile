# Multi-stage build for Vite + TypeScript frontend

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY todo-frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY todo-frontend/ ./

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Runner
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Use default nginx CMD
