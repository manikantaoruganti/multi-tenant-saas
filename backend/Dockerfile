FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client bash

COPY package.json package-lock.json* ./
RUN npm install --only=production

COPY . .

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
