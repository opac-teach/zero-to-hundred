import { NestFactory } from '@nestjs/core';
import { AppModule, registerGlobals } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  registerGlobals(app);

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Zero to Hundred API')
    .setDescription('The Zero to Hundred memecoin platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  // Get port from environment or use default
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/swagger`,
  );
}

bootstrap();
