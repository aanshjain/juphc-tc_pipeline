FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY graphserver.js ./
COPY UScities.json ./

EXPOSE 4000

CMD ["node", "graphserver.js"]
