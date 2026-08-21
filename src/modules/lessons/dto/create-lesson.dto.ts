import { ApiOperation, ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from "class-validator"

export class CreateLessonDto {
    @ApiProperty({example:0})
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    sectionId!:number

    @ApiProperty({example:"string"})
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name!:string

    @ApiProperty({example:"string"})
    @IsString()
    @IsNotEmpty()
    description!:string
}