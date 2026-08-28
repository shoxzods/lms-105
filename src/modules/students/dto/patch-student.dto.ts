import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsMobilePhone, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class PatchStudentDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    @MinLength(5)
    full_name!:string


    @ApiProperty({example:1})
    @IsInt()
    @IsPositive()
    courseId!:number

    @IsMobilePhone()
    @IsOptional()
    @MinLength(5)
    @ApiProperty({example:"+9989(*)"})
    phone_number!:string
}