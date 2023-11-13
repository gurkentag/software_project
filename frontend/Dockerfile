FROM node:19
ENV NODE_ENV=production

WORKDIR /app

COPY "package.json" .
COPY "package-lock.json" .
COPY . .

RUN npm install --production
RUN npm run build
RUN npm install -g serve 



CMD [ "serve", "-s" , "build"]