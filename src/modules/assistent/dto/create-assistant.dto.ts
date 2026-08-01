import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

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
    @IsArray()
    @Type(() => Number)
    @IsOptional()
    @IsInt({each:true})
    courses!:number[]

    @ApiProperty({example:"12345"})
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    password!:string
}