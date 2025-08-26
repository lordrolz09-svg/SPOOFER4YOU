# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy frontend source
COPY . .

# Build frontend
RUN pnpm run build

# Stage 2: Backend runtime
FROM node:18-alpine AS backend
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Create uploads directory
RUN mkdir -p uploads

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "start"]