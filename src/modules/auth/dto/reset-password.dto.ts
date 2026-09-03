import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/config/password";
import { IsMobilePhone, IsString, Length } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "+998901234599" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "963743" })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsStrongPassword()
  password!: string;
}
