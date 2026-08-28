import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateLessonMaterialDto {
    @ApiProperty({example:1 , required:true})
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    lessonId!:number

    @ApiProperty({example:"string" , required:true})
    @IsString()
    description!:string
}