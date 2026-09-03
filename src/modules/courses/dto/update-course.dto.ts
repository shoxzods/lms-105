import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, Min, ValidateIf } from "class-validator";
import { CreateCourseDto } from "./create-course.dto";

/**
 * `assistantId` bu yerda qaytadan e'lon qilinadi, chunki tahrirlashda
 * uni `null` qilib bo'shatish kerak — CreateCourseDto da esa u faqat son.
 * Shuning uchun avval `OmitType` bilan olib tashlanadi.
 */
export class UpdateCourseDto extends OmitType(PartialType(CreateCourseDto), [
  "assistantId",
] as const) {
  @ApiPropertyOptional({
    example: 7,
    description: "Bo'sh yuborilsa assistent olib tashlanadi",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === "" || value === null ? null : Number(value),
  )
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  assistantId?: number | null;
}
