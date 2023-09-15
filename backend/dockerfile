FROM node:18

WORKDIR /usr/src/app

COPY package*.json /

RUN npm install

RUN npx prisma generate
# RUN npx prisma migrate dev

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]