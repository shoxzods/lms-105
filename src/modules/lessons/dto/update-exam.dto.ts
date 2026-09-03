import {  ApiProperty } from "@nestjs/swagger";
import { Variants } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsPositive , IsString, MinLength } from "class-validator";

export class UpdateExamDto {
  @ApiProperty({type:"number" , example:12})
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  lesson_id?: number;

  @ApiProperty({type:"string"})
  @IsString()
  @MinLength(5)
  @IsOptional()
  question?:string
  
  @ApiProperty({type:"string"})
  @IsString()
  @IsOptional()
  variantA?:string
  
  @ApiProperty({type:"string"})
  @IsString()
  @IsOptional()
  variantB?:string
  
  @ApiProperty({type:"string"})
  @IsString()
  @IsOptional()
  variantC?:string
  
  @ApiProperty({type:"string"})
  @IsString()
  @IsOptional()
  variantD?:string

  @ApiProperty({type:"string" , enum:["variantA" , "variantB" , "variantC" , "variantD"]})
  @IsEnum(["variantA", "variantB", "variantC", "variantD"])
  @IsOptional()
  answer?:Variants
}