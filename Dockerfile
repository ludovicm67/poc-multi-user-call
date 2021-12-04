FROM docker.io/library/node:16-alpine

EXPOSE 8080

WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js" ]
