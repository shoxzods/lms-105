import {  ApiProperty } from "@nestjs/swagger";
import { Variants } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsPositive , IsString, MinLength } from "class-validator";

export class CreateExamDto {
  @ApiProperty({type:"number" , example:12})
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  lesson_id!: number;

  @ApiProperty({type:"string"})
  @IsString()
  @MinLength(5)
  question!:string
  
  @ApiProperty({type:"string"})
  @IsString()
  variantA!:string
  
  @ApiProperty({type:"string"})
  @IsString()
  variantB!:string
  
  @ApiProperty({type:"string"})
  @IsString()
  variantC!:string
  
  @ApiProperty({type:"string"})
  @IsString()
  variantD!:string

  @ApiProperty({type:"string" , enum:["variantA" , "variantB" , "variantC" , "variantD"]})
  @IsEnum(["variantA", "variantB", "variantC", "variantD"])
  answer!:Variants
}