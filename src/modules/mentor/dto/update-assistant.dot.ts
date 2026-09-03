import { ApiProperty } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer";
import { IsArray,  IsInt, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class UpdateAssistantDto {
    @ApiProperty({example:"primov shoxzod" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(5)
    full_name!:string

    @ApiProperty({example:"+998995507613" , required:false})
    @IsPhoneNumber()
    @IsOptional()
    phone_number!:string
    
    @ApiProperty({type:"array" , items:{type:"number" }})
    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
    if (typeof value === "string") {
        return JSON.parse(value);
    }
    return value;
    })
    @Type(() => Number)
    @IsInt({each:true})
    courses!:number[]

    @ApiProperty({example:"12345" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(5)
    password!:string
}