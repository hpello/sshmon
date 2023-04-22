FROM node:18.14.2-alpine as server
WORKDIR /opt/app
COPY server/package.json server/yarn.lock ./
RUN yarn --frozen-lockfile

FROM node:18.14.2-alpine as gui
WORKDIR /opt/app
COPY gui/package.json gui/yarn.lock ./
RUN yarn --frozen-lockfile


FROM node:18.14.2-alpine as test
WORKDIR /opt/app
COPY test/package.json test/yarn.lock ./
RUN yarn --frozen-lockfile
COPY test/tsconfig.json ./

FROM node:18.14.2-alpine

RUN apk add --update --no-cache openssh

COPY test/docker/client/ssh/id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa
COPY test/docker/client/ssh/known_hosts /root/.ssh/

WORKDIR /opt/sshmon

COPY --from=server /opt/app ./server
COPY --from=gui /opt/app ./gui
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY tsconfig.json ./
COPY server/ server/
COPY gui/ gui/

RUN yarn deploy

WORKDIR /opt/test
COPY --from=test /opt/app ./

RUN apk add --update --no-cache bash

RUN (echo 'trap "exit 143" SIGTERM' \
  && echo 'sleep 1d & wait') > /sleep.sh
CMD ["sh", "/sleep.sh"]
