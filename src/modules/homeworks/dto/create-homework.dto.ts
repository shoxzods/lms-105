import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

const toNumber = ({ value }: { value: unknown }) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

export class CreateHomeworkDto {
  @ApiProperty({ example: "HTML sahifa yasang va yuklang" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ example: 1 })
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  lessonId!: number;
}
