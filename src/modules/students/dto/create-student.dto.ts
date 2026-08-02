import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator"

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

    @ApiProperty({example:"string"})
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password!:string
}