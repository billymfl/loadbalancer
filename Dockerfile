FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 80
#CMD [ "npm", "start" ]
ENTRYPOINT ["npm", "start"]