import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator"

export class CreateMentorDto {
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


// mentorInfo:
    @ApiProperty({example:"1.2" , required:false})
    @IsOptional()
    @IsNumber()
    @Max(100)
    @Min(1)
    experience!:number
    
    @ApiProperty({example:"teacher" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(3)
    job?:string

    @ApiProperty({example:"http://wwwschool.com" , required:false})
    @IsString()
    @IsOptional()
    @MinLength(5)
    web_link?:string 

    @ApiProperty({example:"string" , required:false})
    @IsString()
    @IsOptional()
    description?: string
    
    @ApiProperty({example:"https://www.facebook.com" , required:false})
    @IsString()
    @IsOptional()
    facebook?:string
    
    @ApiProperty({example:"https://web.telegram.org" , required:false})
    @IsString()
    @IsOptional()
    telegram?:string
    
    @ApiProperty({example:"https://uz.linkedin.com" , required:false})
    @IsString()
    @IsOptional()
    linkedIn?:string
    
    @ApiProperty({example:"https://www.instagram.com" , required:false})
    @IsString()
    @IsOptional()
    instagram?:string
    
    @ApiProperty({example:"https://github.com/" , required:false})
    @IsString()
    @IsOptional()
    github?:string
}