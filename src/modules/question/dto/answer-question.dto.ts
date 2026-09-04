import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AnswerQuestionDto {
  @ApiProperty({ example: "Javob shundan iboratki...", description: "Javob matni" })
  @IsNotEmpty({ message: "Javob matnini yozing" })
  @IsString()
  answer!: string;
}
