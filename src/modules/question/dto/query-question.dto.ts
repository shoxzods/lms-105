import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { QuestionStatus } from "@prisma/client";

export class QueryQuestionDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  limit: number = 10;

  @ApiPropertyOptional({ description: "Qidiruv (o'quvchi ismi yoki savol/javob matni bo'yicha)" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Kurs ID" })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  courseId?: number;

  @ApiPropertyOptional({ enum: QuestionStatus, description: "Holat (PENDING | ANSWERED)" })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @ApiPropertyOptional({ description: "Boshlanish sanasi (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Tugash sanasi (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  to?: string;
}
