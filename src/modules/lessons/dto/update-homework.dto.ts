import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateHomeworkDto {
    @IsInt()
    @Transform(({ value }) => !value ? undefined : value)
    @Type(() => Number)
    @IsPositive()
    @IsOptional()
    lessonId?: number

    @IsOptional()
    @IsString()
    title?: string
}