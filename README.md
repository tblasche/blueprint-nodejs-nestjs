# NodeJS NestJS Starter
[![Build Status](https://github.com/tblasche/blueprint-nodejs-nestjs/actions/workflows/main.yml/badge.svg)](https://github.com/tblasche/blueprint-nodejs-nestjs/actions/workflows/main.yml)
[![License](https://img.shields.io/github/license/tblasche/blueprint-nodejs-nestjs)](https://github.com/tblasche/blueprint-nodejs-nestjs/blob/main/LICENSE)
[![Code Coverage](https://sonarcloud.io/api/project_badges/measure?project=tblasche_blueprint-nodejs-nestjs&metric=coverage)](https://sonarcloud.io/summary/new_code?id=tblasche_blueprint-nodejs-nestjs)

Blueprint of a NestJS Service with enterprise features like JSON logging, Swagger UI or Prometheus Metrics included.

## Tech
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)

The service...
* is `docker`'ized
* utilizes `Jest` and `Testcontainers` for unit and integration testing
* uses `Prisma` ORM for database interaction
* provides `Prometheus` metrics
* provides `Swagger UI` and `OpenAPI Specification`
* writes `access and application logs` in `JSON` format
* utilizes `GitHub Actions` for CI/CD
* performs static code analysis via `SonarCloud`

## Run locally
* Native: http://localhost:3000/apidoc
  ```console
  npm install
  npm run start:dev
  ```
* Via Docker: http://localhost:3000/apidoc
  ```console
  docker compose up --build
  ```

## API Docs / Swagger UI
Find API docs at `/apidoc`

## Common Actions
* Install dependencies
  ```console
  npm install
  ```
* Start application in dev mode and find API docs at http://localhost:3000/apidoc
  ```console
  npm run start:dev
  ```
* Build docker image and run via `docker compose`. Find API docs at http://localhost:3000/apidoc
  ```console
  docker compose up --build
  ```
* Run all tests
  ```console
  npm run test
  ```
* Run linting
  ```console
  npm run lint
  ```
* Generate Code Coverage Report. HTML Report can be found in `./coverage/lcov-report/index.html`
  ```console
  npm run test:cov
  ```
* Check for outdated dependencies
  ```console
  npm outdated
  ```

## How-To

### Use logger

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class FooBarService {
  private readonly logger: Logger = new Logger(FooBarService.name);
}
```

### Log errors properly

With NestJS, there are a few possibilities, which deliver a good result:
```typescript
const e: Error; // either from try/catch or Promise.catch

// log custom error message and error stack
this.logger.error('Something bad happened', e.stack)

// log error object with message, stack, cause etc.
this.logger.error(e)

// log custom error message and error object with message, stack, cause etc.
this.logger.error(e, 'Something bad happened')
```

### Add new configuration property

1. Add default value for the new property to `.env.dist`, e.g.
   ```text
   ENV_PROPERTY_XY=42
   ```
2. Define property validation rules in `src/app.config.validation-schema.ts` using `Joi`, e.g.
   ```typescript
   export const appConfigValidationSchema = {
     // ...
     ENV_PROPERTY_XY: Joi.number().required().description('Short description of the property'),
     // ...
   };
   ```
3. Use the new property within your code
   ```typescript
   import { Module } from '@nestjs/common';
   import { ConfigService } from '@nestjs/config';

   @Module({
     providers: [ConfigModule]
   })
   export class ExampleModule {
     constructor(private readonly configService: ConfigService) {
       const envPropertyXy: number = Number(this.configService.get<string>('ENV_PROPERTY_XY'));
     }
   }
   ```

### Change database schema

1. Make your schema changes in `/prisma/schema.prisma`. See [Prisma Docs](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)
2. Make sure you have Prisma installed via running `npm install`
3. Generate migration scripts in `/prisma/migrations/`
   1. Start local Postgres via Docker: `docker run --name postgres --rm -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=blueprint -p 5432:5432 -it postgres:alpine`
   2. Generate migrations: `DATABASE_URL=postgresql://user:pass@localhost:5432/blueprint npx prisma migrate dev`
4. Commit the newly generated migration scripts in `/prisma/migrations/`
5. Update DB on all environments via `npx prisma migrate deploy`

### Make HTTP requests

One option to make HTTP calls is to use the `HttpService` from the `InfrastructureModule`:

```typescript
await httpService
  .fetch(URL)
  .then((response) => {/* handle response */})
  .catch((e) => {/* handle error*/});
```
OR
```typescript
try {
  await httpService.fetch(URL);
  /* handle response */
} catch (e) {
  /* handle error*/
}
```
