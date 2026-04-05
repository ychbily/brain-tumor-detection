# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies (fallback to npm if others aren't used easily)
RUN npm install

# Copy all files
COPY . .

# Build the frontend (Vite builds into 'dist')
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration to suppress Chrome DevTools errors
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]