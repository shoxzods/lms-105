import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number;

  @ApiPropertyOptional({
    example: 9,
    description: "Admin boshqa student nomidan qo'shsa. Student o'zi yuborsa e'tiborsiz qoldiriladi",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: "Faqat admin belgilaydi. Student uchun doim PENDING",
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
