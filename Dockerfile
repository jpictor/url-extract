# url-extract port 2223
FROM ubuntu:16.04
LABEL maintainer "jay.painter@gmail.com"

FROM ubuntu:16.04
RUN apt-get -y update \
 && apt-get -y install apt-utils \
 && apt-get -y upgrade
RUN apt-get -y install wget curl build-essential libssl-dev apt-transport-https ca-certificates \
    libxrender1 xfonts-utils xfonts-base xfonts-75dpi libfontenc1 x11-common xfonts-encodings \
    libxfont1 fontconfig libxext6 libfontconfig1 chromium-browser

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb \
 && dpkg -i dumb-init_*.deb

ENV APP_DIR /opt/url-extract
ENV NVM_DIR /opt/nvm
ENV NODE_VERSION 6.9

WORKDIR ${APP_DIR}

RUN mkdir -p /opt \
 && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash

RUN ls -l /opt

RUN /bin/bash -c "source ${NVM_DIR}/nvm.sh \
 && nvm install ${NODE_VERSION} \
 && nvm alias default ${NODE_VERSION} \
 && nvm use default"

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

COPY . ${APP_DIR}/

RUN /bin/bash -c "source ${NVM_DIR}/nvm.sh \
 && ls -l \
 && npm install \
 && npm run build"

EXPOSE 2223

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./run.sh"]
