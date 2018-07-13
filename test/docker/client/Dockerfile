FROM node:9.2.0-alpine

# dependencies
RUN apk add --update --no-cache openssh

COPY test/docker/client/ssh/id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa
COPY test/docker/client/ssh/known_hosts /root/.ssh/

# sshmon
WORKDIR /opt/sshmon

COPY package.json package-lock.json ./
COPY gui/package.json gui/package-lock.json gui/
COPY server/package.json server/package-lock.json server/
RUN npm run install-all

COPY tsconfig.json tslint.yml ./
COPY server/ server/
COPY gui/ gui/

RUN npm run deploy

# test
WORKDIR /opt/test
COPY test/docker/client/package.json test/docker/client/package-lock.json ./
RUN npm install

RUN apk add --update --no-cache bash

RUN (echo 'trap "exit 143" SIGTERM' \
  && echo 'sleep 1d & wait') > /sleep.sh
CMD ["sh", "/sleep.sh"]
