import { ApiProperty } from "@nestjs/swagger"
import { IsMobilePhone, IsOptional, IsString, MinLength } from "class-validator"

export class PatchStudentDto {
    @ApiProperty({example:"string"})
    @IsString()
    @IsOptional()
    @MinLength(5)
    full_name!:string

    @IsMobilePhone()
    @IsOptional()
    @MinLength(5)
    @ApiProperty({example:"+9989(*)"})
    phone_number!:string
}