FROM alpine:3.7

RUN apk add --update --no-cache openssh

COPY ssh/id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa
COPY ssh/authorized_keys /root/.ssh/

# http server
RUN apk add --update --no-cache busybox busybox-extras # httpd
RUN echo 'Hello from server' > hello

RUN (echo 'trap "exit 143" SIGTERM' \
  && echo '(httpd && /usr/sbin/sshd -D -h /root/.ssh/id_rsa) & wait') > /run.sh
CMD ["sh", "/run.sh"]
