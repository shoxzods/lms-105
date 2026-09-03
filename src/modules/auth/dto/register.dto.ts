import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "../../../common/config/password";
import {
  IsNotEmpty,
  IsString,
  Matches,
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
  @Matches(/^\+998(77|33|90|91|93|94|95|97|98|99|88|50|55)\d{7}$/, {
    message: "Telefon raqami noto'g'ri formatda",
  })
  phone!: string;

  @IsStrongPassword()
  password!: string;
}
