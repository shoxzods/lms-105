import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class UpdateSectionsDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    name!:string

    @ApiProperty({example:"number"})
    @IsInt()
    @IsOptional()
    @IsPositive()
    courseId!:number
}