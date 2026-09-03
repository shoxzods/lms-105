import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

const toNumber = ({ value }: { value: unknown }) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

export class CreateMaterialDto {
  @ApiProperty({ example: "Darsda ishlatilgan kod va slaydlar" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ example: 1 })
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  lessonId!: number;
}
