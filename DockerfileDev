FROM node:12-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g nodemon
RUN npm install

COPY . .

CMD [ "npm", "run", "start:prod" ]