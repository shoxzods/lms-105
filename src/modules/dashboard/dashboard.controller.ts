import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "src/common/decorators/role";
import { CurrentUser } from "src/common/decorators/current-user";
import type { CurrentUserPayload } from "src/common/decorators/current-user";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { DashboardService } from "./dashboard.service";
import { NotificationsQueryDto } from "./dto/notifications-query.dto";

@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Get dashboard stats` })
  @Get("stats")
  async stats() {
    return { success: true, data: await this.dashboardService.stats() };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "[All authenticated users] Get notification counts" })
  @Get("notifications")
  async notifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: NotificationsQueryDto,
  ) {
    return {
      success: true,
      data: await this.dashboardService.notifications(user, query.since),
    };
  }
}
