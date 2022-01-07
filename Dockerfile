FROM docker.io/library/node:16-alpine

EXPOSE 3000

WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
CMD [ "npm", "run", "start" ]
