import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsMobilePhone,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateMentorDto {
  @ApiPropertyOptional({ example: "Dilshod Teacher" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  full_name?: string;

  @ApiPropertyOptional({ example: "+998901234567" })
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @ApiPropertyOptional({ example: "dilshod@gmail.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "Frontend developer" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  experience?: number;

  @ApiPropertyOptional({ example: "5 yildan beri dars beraman" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: "https://dilshod.uz" })
  @IsOptional()
  @IsUrl()
  web_link?: string;

  @ApiPropertyOptional({ example: "https://t.me/dilshod" })
  @IsOptional()
  @IsUrl()
  telegram?: string;

  @ApiPropertyOptional({ example: "https://github.com/dilshod" })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiPropertyOptional({ example: "https://instagram.com/dilshod" })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ example: "https://facebook.com/dilshod" })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ example: "https://linkedin.com/in/dilshod" })
  @IsOptional()
  @IsUrl()
  linkedin?: string;
}
