import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCourseCategoryDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    name!: string
}