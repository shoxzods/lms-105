import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule} from '@nestjs/swagger';
import config from "./common/config/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( new ValidationPipe({whitelist:true , transform:true}));
  app.setGlobalPrefix("api/v1")
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
    
  await app.listen(process.env.PORT ?? 3500,"0.0.0.0");
}
bootstrap(); 