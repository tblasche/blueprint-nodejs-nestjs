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
  npm install
  ```
* Start application in dev mode and find API docs at `http://localhost:3000/apidoc`
  ```console
  npm run start:dev
  ```
* Run tests
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
* Build docker image and run via `docker compose`. Find API docs at `http://localhost:3000/apidoc`
  ```console
  docker compose up --build
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

1. Define new property in `src/app.config.ts` using `Joi`, e.g.
```typescript
export const appConfigValidationSchema = {
  // ...
  FANCY_STRING_PROPERTY: Joi.string().required().description('Short description of you fancy new property'),
  // ...
};
```
2. Add default value for the new property to `.env.dist`, e.g.
```text
FANCY_STRING_PROPERTY=value
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
    const stringProperty = this.configService.get<string>('FANCY_STRING_PROPERTY');
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
