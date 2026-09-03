import { ApiPropertyOptional } from "@nestjs/swagger";
import { ExamStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryExamResultDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "O'quvchining ismi yoki familiyasi bo'yicha qidiruv",
    example: "Istamov",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sectionId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonId?: number;

  @ApiPropertyOptional({
    enum: ExamStatus,
    description: "PASSED yoki FAILED",
    example: ExamStatus.PASSED,
  })
  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @ApiPropertyOptional({
    description: "Boshlanish sanasi (YYYY-MM-DD yoki DD.MM.YYYY)",
    example: "2024-08-04",
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Tugash sanasi (YYYY-MM-DD yoki DD.MM.YYYY)",
    example: "2024-08-05",
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Sana oralig'i (masalan: 04.08.2024-05.08.2024)",
    example: "04.08.2024-05.08.2024",
  })
  @IsOptional()
  @IsString()
  dateRange?: string;
}
