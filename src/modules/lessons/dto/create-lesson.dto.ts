import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const toNumber = ({ value }: { value: unknown }) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

export class CreateLessonDto {
  @ApiProperty({ example: "1-dars: HTML asoslari" })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "HTML teglari bilan tanishamiz" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ example: 1 })
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  sectionId!: number;
}
