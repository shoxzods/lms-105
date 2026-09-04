import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { SubmissionStatus } from "@prisma/client";

export class QuerySubmissionDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  limit: number = 10;

  @ApiPropertyOptional({ description: "Kurs ID" })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ""
      ? Number(value)
      : undefined,
  )
  courseId?: number;

  @ApiPropertyOptional({ description: "Dars ID" })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ""
      ? Number(value)
      : undefined,
  )
  lessonId?: number;

  @ApiPropertyOptional({
    enum: SubmissionStatus,
    description: "Holat (PENDING | GRADED | REJECTED)",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === "" || value === "undefined" ? undefined : value,
  )
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiPropertyOptional({
    description: "Qidiruv (talaba ismi yoki dars nomi bo'yicha)",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === "" || value === "undefined" ? undefined : value,
  )
  @IsString()
  search?: string;
}
