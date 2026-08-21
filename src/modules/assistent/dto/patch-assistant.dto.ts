import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class PatchAssistantDto {
    @ApiProperty({example:"primov shoxzod" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(5)
    full_name!:string

    @ApiProperty({example:"+998995507613" , required:false})
    @IsPhoneNumber()
    @IsOptional()
    phone_number!:string
    
    @ApiProperty({example:[1,2,3] , required:false})
    @IsArray()
    @Type(() => Number)
    @IsOptional()
    @IsInt({each:true})
    courseId!:number

    @ApiProperty({example:"example@gmail.com" , required:false})
    @IsOptional()
    @IsEmail()
    email?:string

    @ApiProperty({example:"12345" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(5)
    password!:string
}