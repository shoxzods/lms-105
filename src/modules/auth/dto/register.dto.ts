import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    full_name!:string
    
    
    @ApiProperty({example:"+998995507613" })
    @IsMobilePhone()
    phone_number!:string
    
    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    password!:string

    @ApiProperty({type:"string"})
    @IsString()
    @MinLength(5)
    confirm_password!:string
}