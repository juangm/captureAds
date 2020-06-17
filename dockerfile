FROM node:12-slim

# System dependencies.
RUN \
  # Install.
  apt update && apt install -y \
  # Base system.
  software-properties-common curl unzip \
  # Core.
  build-essential git  \
  # Install xvfb.
  xvfb

RUN \
  # Chrome repo.
  curl -sS https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list && \
  # Install Chrome and dependencies
  apt update && apt install -y \
  libelf-dev google-chrome-stable

RUN \
  # Install ChromeDriver.
  CHROMEDRIVER_VERSION=`curl -sS https://chromedriver.storage.googleapis.com/LATEST_RELEASE` && \
  curl https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip --output chromedriver_linux64.zip && \
  unzip chromedriver_linux64.zip && \
  rm chromedriver_linux64.zip && \
  mv -f chromedriver /usr/bin/chromedriver && \
  chmod 0755 /usr/bin/chromedriver

RUN mkdir /app
WORKDIR /app

# Copy the files to app directory
COPY . /app/

# Install the packages
RUN yarn install
