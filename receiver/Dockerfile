FROM node:alpine

WORKDIR /usr/src/app
RUN npm i express body-parser

COPY index.js ./

CMD [ "node", "index.js" ]