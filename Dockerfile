# Use Node.js 22 LTS
FROM node:22.17.1-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
