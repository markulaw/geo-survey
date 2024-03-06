FROM node:16

ARG MONGODB_URL=localhost

ENV PORT=4000 \
    MONGODB_URI=mongodb://${MONGODB_URL}:27017

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run tsc

EXPOSE 4000
CMD [ "npm", "start" ]