import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCourseCategoryDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name!: string
}