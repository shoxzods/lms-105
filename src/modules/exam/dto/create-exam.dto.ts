import { ApiProperty } from "@nestjs/swagger";
import { Answer } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateExamDto {
  @ApiProperty({ example: "HTML nimani anglatadi?" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  question!: string;

  @ApiProperty({ example: "HyperText Markup Language" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  variantA!: string;

  @ApiProperty({ example: "High Level Machine Language" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  variantB!: string;

  @ApiProperty({ example: "Home Tool Markup Language" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  variantC!: string;

  @ApiProperty({ example: "Hyperlink Text Mode Language" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  variantD!: string;

  @ApiProperty({ enum: Answer, example: Answer.variantA })
  @IsEnum(Answer)
  answer!: Answer;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonId!: number;
}
