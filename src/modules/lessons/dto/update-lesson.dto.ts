import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class UpdateLessonDto {
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @IsPositive()
    sectionId!:number

    @IsString()
    @IsOptional()
    @MinLength(3)
    name!:string

    @IsString()
    @IsOptional()
    description!:string
}