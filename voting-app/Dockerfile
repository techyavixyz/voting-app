# FROM node:23-alpine
FROM node:23.5.0-alpine 
WORKDIR /app


COPY package*.json ./
RUN npm install -f
RUN npm install -g nodemon


COPY . .


CMD ["nodemon", "server.js"]