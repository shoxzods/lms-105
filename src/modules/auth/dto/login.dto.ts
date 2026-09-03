import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "+998775507613",
    description: "Uzbekistan phone number",
  })
  @Matches(/^\+998(77|33|90|91|93|94|95|97|98|99|88|50|55)\d{7}$/, {
    message: "Telefon raqami noto'g'ri formatda",
  })
  phone!: string;

  @ApiProperty({
    example: "x04041234A",
  })
  @IsString()
  password!: string;
}