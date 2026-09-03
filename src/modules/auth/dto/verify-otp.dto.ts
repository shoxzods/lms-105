import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "+998901234599" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "963743" })
  @IsString()
  @Length(6, 6)
  otp!: string;
}
