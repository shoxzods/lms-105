import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class NotificationsQueryDto {
  @ApiPropertyOptional({
    example: "2026-09-03T08:00:00.000Z",
    description: "Shu vaqtdan keyingi suhbat xabarlari sanaladi",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "since ISO sana formatida bo'lishi kerak" })
  since?: Date;
}
