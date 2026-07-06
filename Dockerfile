# Use official Node runtime
FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the Vite development server
# --host 0.0.0.0 is critical in Docker so the port is exposed outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
