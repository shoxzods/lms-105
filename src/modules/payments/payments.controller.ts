import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { PaymentsService } from "./payments.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "src/common/decorators/current-user";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { QueryPaymentDto } from "./dto/query-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(UserRole.STUDENT, UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: "Kursga to'lov qilish",
    description:
      "Student o'ziga to'lov qiladi. Admin `userId` va `status` yuborib, boshqa student nomidan qo'sha oladi.",
  })
  @Post()
  create(@Body() payload: CreatePaymentDto, @Req() req: Request) {
    return this.paymentsService.create(req["user"], payload);
  }

  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "O'z to'lovlarim" })
  @Get("my")
  findMy(@CurrentUser("id") userId: number) {
    return this.paymentsService.findMy(userId);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Barcha to'lovlar" })
  @Get()
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "To'lovni tasdiqlash yoki rad etish" })
  @Patch(":userId/:courseId")
  updateStatus(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("courseId", ParseIntPipe) courseId: number,
    @Body() payload: UpdatePaymentDto,
  ) {
    return this.paymentsService.updateStatus(userId, courseId, payload);
  }
}
