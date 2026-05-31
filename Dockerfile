# Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
# We add build tools in case native modules like better-sqlite3 need to be compiled
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm ci

# Copy all files
COPY . .

# Build Vite frontend and esbuild backend
RUN npm run build

# Production stage
FROM node:22-bookworm-slim

WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/dist ./dist

# Create directories for sqlite data and file uploads
RUN mkdir -p uploads data

# Ensure the node user owns the working directory and created directories
RUN chown -R node:node /app

# Switch to standard unprivileged node user
USER node

# Expose the correct port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
