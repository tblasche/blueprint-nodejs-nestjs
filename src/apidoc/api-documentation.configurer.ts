import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export class ApiDocumentationConfigurer {
  private static readonly swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      tryItOutEnabled: true
    }
  };

  static configure(app: NestFastifyApplication): void {
    SwaggerModule.setup(
      'apidoc',
      app,
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle(app.get(ConfigService).get<string>('APP_NAME') || '')
          .setDescription(app.get(ConfigService).get<string>('APP_DESCRIPTION') || '')
          .addBasicAuth()
          .build()
      ),
      this.swaggerCustomOptions
    );
  }
}
