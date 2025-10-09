import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AddressInfo } from 'net';

const OpenApiReferenceEndpoint: string = '/api';

const isAddressInfo = (address: unknown): address is AddressInfo => {
  return typeof address === 'object' && address !== null && 'port' in address;
};

const logHttpServerInformation = (app: NestExpressApplication) => {
  const addressInfo = app.getHttpServer().address();

  if (isAddressInfo(addressInfo) === false) {
    return;
  }

  const { address, port } = addressInfo;

  const baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;

  console.log('HTTP Server listening on port %d', port);
  console.log(
    'API Reference (OpenAPI): %s',
    `${baseUrl}${OpenApiReferenceEndpoint}`,
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração de CORS para funcionar com ngrok
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://*.ngrok-free.app',
      'https://*.ngrok.io',
      'http://localhost:*',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],
  });

  // Middleware para lidar com headers do ngrok
  app.use((req: any, res: any, next: any) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
  });

  const openApiConfig = new DocumentBuilder()
    .setTitle('NestJS Quickstart')
    .setDescription('API description goes here')
    .setVersion('1.0')
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    OpenApiReferenceEndpoint,
    apiReference({
      content: openApiDocument,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, () =>
    logHttpServerInformation(app),
  );
}
bootstrap();
