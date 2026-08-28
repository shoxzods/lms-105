import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty, IsPhoneNumber, IsPositive, IsString, MinLength } from "class-validator"

export class CreateStudentDto {
    
    @ApiProperty({example:"string"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    full_name!:string

    @ApiProperty({example:"+998(9*)"})
    @IsPhoneNumber()
    @IsNotEmpty()
    phone_number!:string

    @ApiProperty({example:1})
    @IsInt()
    @IsPositive()
    courseId!:number

    @ApiProperty({example:"string"})
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password!:string
}