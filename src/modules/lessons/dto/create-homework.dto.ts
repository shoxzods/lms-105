import { Type } from "class-transformer";
import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateHomeworkDto {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    lessonId!:number

    @IsString()
    title!:string
}