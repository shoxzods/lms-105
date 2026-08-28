import { ApiProperty } from "@nestjs/swagger"
import { Courselevel } from "@prisma/client"
import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class CreateCourseDto {
  @ApiProperty({description:"string"})
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
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

  @ApiProperty({description:"integer"})
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  categoryId!:number


  @ApiProperty({description:"string" , enum:["BEGINNER" ,  "ELEMENTARY" , "PRE_INTERMIDIATE" , "INTERMIDIATE"]})
  @IsString()
  @IsNotEmpty()
  level!:Courselevel
}