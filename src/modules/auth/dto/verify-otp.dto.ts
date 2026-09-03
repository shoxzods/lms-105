import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "+998901234599" })
  @Matches(/^\+998(77|33|90|91|93|94|95|97|98|99|88|50|55)\d{7}$/, {
    message: "Telefon raqami noto'g'ri formatda",
  })
  phone!: string;

  @ApiProperty({ example: "963743" })
  @IsString()
  @Length(6, 6)
  otp!: string;
}
