import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class CreateAdminDto {
    @ApiProperty({example:"primov shoxzod"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    full_name!:string

    @ApiProperty({example:"+998995507613"})
    @IsPhoneNumber()
    @IsNotEmpty()
    phone_number!:string
    
    @ApiProperty({example:"12345"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    password!:string
}