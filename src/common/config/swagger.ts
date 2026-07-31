import { DocumentBuilder } from "@nestjs/swagger";

export default new DocumentBuilder()
    .setTitle('LMS N-105')
    .setDescription('this is an studying website')
    .setVersion('1.0')
    .addBearerAuth()
    .build();