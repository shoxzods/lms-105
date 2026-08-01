import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class PatchAdminDto {
  @ApiProperty({example:"Shoxzod Primov" , required:false})
  @IsString()
  @IsOptional()
  @MinLength(5)
  full_name?:string

  @ApiProperty({example:"+998775507613" , required:false})
  @IsOptional()
  @IsPhoneNumber()
  phone_number?:string

  @ApiProperty({example:"example@mail.com" , required:false})
  @IsOptional()
  @IsEmail()
  email?:string
  
  @ApiProperty({example:"12345" , required:false})
  @IsOptional()
  @MinLength(5)
  password?:string
}