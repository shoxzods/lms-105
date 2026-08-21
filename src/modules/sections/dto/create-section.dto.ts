import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from "class-validator";

export class CreateSectionsDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name!:string


    @ApiProperty({example:"number"})
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    courseId!:number
}