# Use Node.js 22.17.1 Alpine
FROM node:22.17.1-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Run seeder then start app
CMD ["sh", "-c", "npm run seed && npm run start:dev"]
