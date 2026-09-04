import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuestionDto {
  @ApiProperty({ example: 1, description: "Kurs ID-si" })
  @Transform(({ value }) => Number(value))
  courseId!: number;

  @ApiPropertyOptional({ example: 1, description: "Bo'lim ID-si" })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  sectionId?: number;

  @ApiPropertyOptional({ example: 1, description: "Dars ID-si" })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  lessonId?: number;

  @ApiProperty({ example: "DOM hususiyatlarini barchasini ro'yxati bormi sizda?", description: "Savol matni" })
  @IsNotEmpty({ message: "Savol matni kiritilishi shart" })
  @IsString()
  question!: string;
}
