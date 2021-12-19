FROM node:16-alpine

RUN apk update

WORKDIR /app

COPY ./ ./

# Installing dependencies and building typescript files
RUN npm install
RUN npm run postinstall

CMD [ "npm", "start" ]