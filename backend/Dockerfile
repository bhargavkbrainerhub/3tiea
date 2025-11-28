# Use Node 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Install netcat (use netcat-openbsd)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy all app files
COPY . .

# Make wait-for-mysql.sh executable
RUN chmod +x /app/wait-for-mysql.sh

# Expose backend port
EXPOSE 3500

# Run wait-for-mysql.sh
CMD ["./wait-for-mysql.sh"]
