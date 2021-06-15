# Capturing ADS

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)
This project is no longer supported.

## Description

- Automated capturing of specific ad units
- Generate JSON file with ads location in page
- Generate image .png with ads marked in red

## Requirements

Run locally without using docker:

- [Node](https://nodejs.org/en/) at least version 10.13.0
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

Run locally using docker:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker-compose](https://docs.docker.com/compose/install/)

## Run

Run locally without using docker and docker-compose:

```sh
# Install dependencies
yarn install

# Run the script
node index.js
```

Run locally using docker:

```sh
# Build the image
docker-compose build ad-track

# Start the container and open a bash console
docker-compose run --rm ad-track bash

# Run the script (using xvfb because headless not working with extensions)
xvfb-run node index.js
```

## Problems found:

Necessary to scroll to the bottom of the page for capturing ads:

- Not all the ads are loaded at the beginning but dynamically when the user scrolls

## Security Audit

:heavy_check_mark: At 29.04.2020 there is no security vulnerabilities in any of the 51 packages used.
