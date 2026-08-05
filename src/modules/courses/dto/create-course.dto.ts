import { ApiProperty } from "@nestjs/swagger"
import { Courselevel } from "@prisma/client"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsPort, IsPositive, IsString, Min, MinLength } from "class-validator"

export class CreateCourseDto {
//intro_video?:
  @ApiProperty({description:"string"})
  @IsString()
  @IsNotEmpty()
  name!:string

  @ApiProperty({description:"string"})
  @IsString()
  @IsNotEmpty()
  description!:string
  
  @ApiProperty({description:"decimal"})
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  prize!:number

  @ApiProperty({description:"string" , enum:["BEGINNER" ,  "ELEMENTARY" , "PRE_INTERMIDIATE" , "INTERMIDIATE"]})
  @IsString()
  @IsNotEmpty()
  level!:Courselevel
}