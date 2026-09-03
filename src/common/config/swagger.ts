import { DocumentBuilder } from "@nestjs/swagger";

export const config = new DocumentBuilder()
  .setTitle("lms_n105")
  .setVersion("1.0")
  .addBearerAuth() //Token chiqarish uchun kere!
  .build();
