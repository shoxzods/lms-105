import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/config/password";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const toNumber = ({ value }: { value: unknown }) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

export class CreateAssistantDto {
  @ApiProperty({ example: "Axmadjon Assistent" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  full_name!: string;

  @ApiProperty({ example: "+998901112233" })
  @IsMobilePhone()
  phone!: string;

  @ApiPropertyOptional({ example: "axmadjon@gmail.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsStrongPassword()
  password!: string;

  @ApiProperty({ example: 1 })
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  courseId!: number;
}
