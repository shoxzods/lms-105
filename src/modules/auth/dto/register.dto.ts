import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/config/password";
import {
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Ali Valiev" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  full_name!: string;

  @ApiProperty({ example: "+998901234599" })
  @IsMobilePhone()
  phone!: string;

  @IsStrongPassword()
  password!: string;
}
