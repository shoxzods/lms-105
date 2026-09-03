import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/config/password";
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAdminDto {
  @ApiProperty({ example: "Javohir Yunusov" }) //() ichiga {example qilib yozib ketsa boladi}!
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  full_name!: string;

  @ApiProperty({ example: "+998977771777" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "javohir@gmail.ru" })
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;
}
