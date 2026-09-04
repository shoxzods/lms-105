import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuestionDto {
  @ApiPropertyOptional({ example: 1, description: "Kurs ID-si" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.course_id ?? obj?.courseId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  courseId?: number;

  @ApiPropertyOptional({ example: 1, description: "Bo'lim ID-si" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.section_id ?? obj?.sectionId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  sectionId?: number;

  @ApiPropertyOptional({ example: 1, description: "Dars ID-si" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.lesson_id ?? obj?.lessonId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  lessonId?: number;

  @ApiProperty({
    example: "DOM hususiyatlarini barchasini ro'yxati bormi sizda?",
    description: "Savol matni",
  })
  @IsNotEmpty({ message: "Savol matni kiritilishi shart" })
  @IsString()
  question!: string;
}
