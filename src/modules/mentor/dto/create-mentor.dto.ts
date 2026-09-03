import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/config/password";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateMentorDto {
  @ApiProperty({ example: "Dilshod Teacher" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  full_name!: string;

  @ApiProperty({ example: "+998901234567" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "dilshod@gmail.com" })
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

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
