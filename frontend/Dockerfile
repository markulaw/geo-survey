# build environment
FROM node:16 as build

WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install --force
COPY . ./
RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "build", "--listen", "3000", "--cors"]