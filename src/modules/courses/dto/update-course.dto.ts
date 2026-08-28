import { ApiProperty } from "@nestjs/swagger"
import { Courselevel } from "@prisma/client"
import { Transform } from "class-transformer"
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class UpdateCourseDto {
  @ApiProperty({ description: "string", required: false })
  @Transform(({ value }) => value === "" ? undefined : value)
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string

  @ApiProperty({ description: "string", required: false })
  @Transform(({ value }) => value === "" ? undefined : value)
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "decimal", required: false })
  @Transform(({ value }) => value === "" ? undefined : Number(value))
  @IsNumber()
  @IsOptional()
  @IsPositive()
  prize?: number

  @ApiProperty({ description: "integer", required: false })
  @Transform(({ value }) => value === "" ? undefined : Number(value))
  @IsInt()
  @IsPositive()
  @IsOptional()
  categoryId?: number

  @ApiProperty({
    description: "string",
    enum: ["BEGINNER", "ELEMENTARY", "PRE_INTERMIDIATE", "INTERMIDIATE"],
    required: false,
  })
  @Transform(({ value }) => value === "" ? undefined : value)
  @IsString()
  @IsOptional()
  level?: Courselevel
}
