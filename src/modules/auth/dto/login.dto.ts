import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "+998901234567" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "parol12345" })
  @IsString()
  password!: string;
}
