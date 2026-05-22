# Use the official Node.js 18 slim image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
# Doing this before copying the full source code takes advantage of Docker's layer caching
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy the rest of the application code
COPY . .

# The application listens on port 3000 by default (per README)
EXPOSE 3000

# Set environment variable to production
ENV NODE_ENV=production

# Command to start the server
CMD ["npm", "start"]