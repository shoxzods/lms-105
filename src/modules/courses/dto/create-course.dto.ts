import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseLevel } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateCourseDto {
  @ApiProperty({ example: "React asoslari" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "React kutubxonasini nolda o'rganamiz" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ example: "1550000" })
  @Transform(({ value }) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level!: CourseLevel;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      "MentorProfile.id (User.id emas). Faqat admin uchun — mentor o'zi yaratganda tokendan olinadi",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  mentorId?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Transform(({ value }) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  assistantId?: number;
}
