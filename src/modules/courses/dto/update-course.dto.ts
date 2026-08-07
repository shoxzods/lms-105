import { ApiProperty } from "@nestjs/swagger"
import { Courselevel } from "@prisma/client"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class UpdateCourseDto {
  @ApiProperty({description:"string"})
  @IsString()
  @IsOptional()
  @MinLength(3)
  name!:string

  @ApiProperty({description:"string"})
  @IsString()
  @IsOptional()
  description!:string
  
  @ApiProperty({description:"decimal"})
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  prize!:number

  @ApiProperty({description:"string" , enum:["BEGINNER" ,  "ELEMENTARY" , "PRE_INTERMIDIATE" , "INTERMIDIATE"]})
  @IsString()
  @IsOptional()
  level!:Courselevel
}