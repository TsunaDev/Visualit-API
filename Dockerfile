FROM node:10
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY blueprint.md /usr/src/app
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
EXPOSE 8088
EXPOSE 8087
CMD npm start & npx snowboard http blueprint.md & npx snowboard mock blueprint.md