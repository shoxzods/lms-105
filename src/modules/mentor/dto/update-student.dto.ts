import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdateStudentDto {
    @ApiProperty({type:"string"})
    @IsString()
    @IsOptional()
    full_name!:string
    
    @ApiProperty({type:"string"})
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
}