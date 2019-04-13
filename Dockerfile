FROM node:11-alpine
MAINTAINER stanley@stanographer.com
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9090
CMD ["npm", "start"]
