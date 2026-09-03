import { ApiProperty } from "@nestjs/swagger";
import { PaymentStatus } from "@prisma/client";
import { IsIn } from "class-validator";

export class UpdatePaymentDto {
  @ApiProperty({
    enum: [PaymentStatus.COMPLETED, PaymentStatus.REJECTED],
    example: PaymentStatus.COMPLETED,
  })
  @IsIn([PaymentStatus.COMPLETED, PaymentStatus.REJECTED])
  status!: PaymentStatus;
}
