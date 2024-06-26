# NestJS Service Blueprint
[![Build Status](https://github.com/tblasche/blueprint-nodejs-nestjs/actions/workflows/main.yml/badge.svg)](https://github.com/tblasche/blueprint-nodejs-nestjs/actions/workflows/main.yml)
[![License](https://img.shields.io/github/license/tblasche/blueprint-nodejs-nestjs)](https://github.com/tblasche/blueprint-nodejs-nestjs/blob/main/LICENSE)
[![Code Coverage](https://sonarcloud.io/api/project_badges/measure?project=tblasche_blueprint-nodejs-nestjs&metric=coverage)](https://sonarcloud.io/summary/new_code?id=tblasche_blueprint-nodejs-nestjs)

Blueprint of a NestJS Service with enterprise features like JSON logging, Swagger UI or Prometheus Metrics included.

## Tech Info
* Language: Typescript
* Build System: npm
* Containerization: Docker
* Framework: NestJS with fastify
* Testing: Jest
* Metrics: Prometheus
* API Documentation: Swagger UI
* Logging: Access and Application Logs in JSON format
* CI/CD: GitHub Actions
* Static Code Analysis via SonarCloud

## Quick Start
* Install dependencies
  ```console
  $ npm install
  ```
* Start application in dev mode and find API docs at `http://localhost:3000/apidoc`
  ```console
  $ npm run start:dev
  ```
* Run tests
  ```console
  $ npm run test
  ```
* Run linting
  ```console
  $ npm run lint
  ```
* Generate Code Coverage Report. HTML Report can be found in `./coverage/lcov-report/index.html`
  ```console
  $ npm run test:cov
  ```
* Build docker image and run via `docker compose`. Find API docs at `http://localhost:3000/apidoc`
  ```console
  $ docker compose up --build
  ```
* Check for outdated dependencies
  ```console
  $ npm outdated
  ```
