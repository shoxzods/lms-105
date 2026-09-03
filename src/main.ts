import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { config } from "./common/config/swagger";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
// import { corsOptions } from "./common/config/cors"; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), "src", "uploads"), {
    prefix: "/uploads",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix("/api/v1"); //xamma endpointlani oldiga qoyib beradi!

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://lms-n105-frontend.vercel.app",
    ],
    credentials: true,
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();