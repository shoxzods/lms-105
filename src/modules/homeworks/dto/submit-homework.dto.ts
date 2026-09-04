import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SubmitHomeworkDto {
  @ApiProperty({ example: 1, description: "Dars ID-si" })
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.lesson_id ?? obj?.lessonId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  @IsNotEmpty({ message: "Dars ID-si ko'rsatilishi shart" })
  lessonId!: number;

  @ApiPropertyOptional({ example: 1, description: "Kurs ID-si" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.course_id ?? obj?.courseId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  courseId?: number;

  @ApiPropertyOptional({ example: 1, description: "Vazifa ID-si" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const val = value ?? obj?.homework_id ?? obj?.homeworkId;
    return val !== undefined && val !== null && val !== ""
      ? Number(val)
      : undefined;
  })
  homeworkId?: number;

  @ApiPropertyOptional({ description: "Talaba izohi yoki javob matni" })
  @IsOptional()
  @IsString()
  text?: string;
}
