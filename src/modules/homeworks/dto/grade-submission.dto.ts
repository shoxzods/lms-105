import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { SubmissionStatus } from "@prisma/client";

export class GradeSubmissionDto {
  @ApiProperty({ example: 85, description: "Baho / Ball (0 dan 100 gacha)" })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: "Baho kiritilishi shart" })
  @IsInt({ message: "Baho butun son bo'lishi kerak" })
  @Min(0, { message: "Baho 0 dan kam bo'lmasligi kerak" })
  @Max(100, { message: "Baho 100 dan oshmasligi kerak" })
  score!: number;

  @ApiPropertyOptional({ example: "Yaxshi bajarilgan, lekin ba'zi kamchiliklar bor.", description: "Ustoz izohi" })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ enum: SubmissionStatus, default: SubmissionStatus.GRADED, description: "Holat" })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;
}
