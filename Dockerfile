FROM node:lts-alpine
RUN apk add python make g++
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
CMD npm start
