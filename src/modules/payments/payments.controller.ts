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
    summary: `[${UserRole.STUDENT} | ${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Create a payment for a course`,
    description:
      "Students pay for themselves. Admin can provide userId and status to add payment on behalf of another student.",
  })
  @Post()
  create(@Body() payload: CreatePaymentDto, @Req() req: Request) {
    return this.paymentsService.create(req["user"], payload);
  }

  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: `[${UserRole.STUDENT}] Get my own payments` })
  @Get("my")
  findMy(@CurrentUser("id") userId: number) {
    return this.paymentsService.findMy(userId);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get all payments` })
  @Get()
  findAll(@Query() query: QueryPaymentDto, @Req() req: Request) {
    return this.paymentsService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Approve or reject a payment` })
  @Patch(":userId/:courseId")
  updateStatus(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("courseId", ParseIntPipe) courseId: number,
    @Body() payload: UpdatePaymentDto,
  ) {
    return this.paymentsService.updateStatus(userId, courseId, payload);
  }
}
