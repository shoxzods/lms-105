import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PASSWORD_MESSAGE =
  "Parol kamida 8 ta belgidan iborat bo'lib, harf va raqamni o'z ichiga olishi kerak";

export function IsStrongPassword() {
  return applyDecorators(
    ApiProperty({ example: "parol12345", description: PASSWORD_MESSAGE }),
    IsString(),
    MinLength(8, { message: PASSWORD_MESSAGE }),
    MaxLength(50),
    Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE }),
  );
}
