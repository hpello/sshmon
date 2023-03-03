FROM node:18.14.2-alpine

# dependencies
RUN apk add --update --no-cache openssh

COPY test/docker/client/ssh/id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa
COPY test/docker/client/ssh/known_hosts /root/.ssh/

# sshmon
WORKDIR /opt/sshmon

COPY package.json yarn.lock ./
COPY gui/package.json gui/yarn.lock gui/
COPY server/package.json server/yarn.lock server/
RUN yarn

COPY tsconfig.json tslint.yml ./
COPY server/ server/
COPY gui/ gui/

RUN yarn deploy

# test
WORKDIR /opt/test
COPY test/docker/client/package.json test/docker/client/yarn.lock ./
RUN yarn

RUN apk add --update --no-cache bash

RUN (echo 'trap "exit 143" SIGTERM' \
  && echo 'sleep 1d & wait') > /sleep.sh
CMD ["sh", "/sleep.sh"]
