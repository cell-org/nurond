FROM node:16
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 42000
CMD [ "node", "scripts/build.js", "__nuron__/v0", "__keyport__" ]
