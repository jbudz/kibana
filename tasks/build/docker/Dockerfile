ARG node_version
FROM node:$node_version

ENV NPM_CONFIG_LOGLEVEL error

RUN set -x && \
  apt-get update && \
  apt-get install -y \
    ruby-dev \
    ruby \
    zip \
    rpm

WORKDIR /kibana
COPY package.json .
COPY tasks/build/docker/Gemfile .
COPY tasks/build/docker/Gemfile.lock .

RUN npm install
RUN gem install bundler

RUN bundle config --global silence_root_warning 1
RUN bundle install

CMD node_modules/.bin/grunt build $BUILD_OPTIONS
