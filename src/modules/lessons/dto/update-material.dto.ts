import { Type } from "class-transformer";
import { IsInt, IsPositive, IsString } from "class-validator";

export class UpdateLessonMaterialDto {
    @IsInt()
    @Type(() => Number)
    lessonId!:number

    @IsString()
    description!:string
}