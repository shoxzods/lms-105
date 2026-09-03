import { ApiProperty } from "@nestjs/swagger";
import { Answer } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from "class-validator";

export class ExamAnswerDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  examId!: number;

  @ApiProperty({ enum: Answer, example: Answer.variantA })
  @IsEnum(Answer)
  answer!: Answer;
}

export class CheckExamDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonId!: number;

  @ApiProperty({ type: [ExamAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers!: ExamAnswerDto[];
}
