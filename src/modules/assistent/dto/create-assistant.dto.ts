import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class CreateAssistantDto {
    @ApiProperty({example:"primov shoxzod"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    full_name!:string

    @ApiProperty({example:"+998995507613"})
    @IsPhoneNumber()
    @IsNotEmpty()
    phone_number!:string
    
    @ApiProperty({example:[1,2,3]})
    @IsInt()
    @IsNotEmpty()
    courseId!:number

    @ApiProperty({example:"12345"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    password!:string
}