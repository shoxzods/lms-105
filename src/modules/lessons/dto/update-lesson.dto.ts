import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class UpdateLessonDto {
    // @ApiProperty({example:0})
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @IsPositive()
    sectionId!:number

    // @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    name!:string

    // @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    description!:string
}