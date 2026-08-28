import { ApiProperty } from "@nestjs/swagger"
import { IsMobilePhone, IsNotEmpty, IsString, MinLength } from "class-validator"

export class LoginDto {
    @ApiProperty({example:"+998995507613" })
    @IsMobilePhone()
    @IsNotEmpty()
    phone_number!:string
    
    @ApiProperty({example:"12345678"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    password!:string
}