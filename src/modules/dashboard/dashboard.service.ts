import { Injectable } from "@nestjs/common";
import { PaymentStatus, UserRole } from "@prisma/client";
import { CourseOwner } from "src/common/services/course-owner.service";
import { CurrentUserPayload } from "src/common/decorators/current-user";
import { PrismaService } from "src/core/database/prisma.service";

const ADMIN_ROLES: UserRole[] = [UserRole.SUPERADMIN, UserRole.ADMIN];

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly owner: CourseOwner,
  ) {}

  async stats() {
    const [grouped, courses] = await Promise.all([
      this.prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      this.prisma.courses.count(),
    ]);

    const byRole = (role: UserRole) =>
      grouped.find((row) => row.role === role)?._count._all ?? 0;

    return {
      admins: byRole(UserRole.ADMIN),
      mentors: byRole(UserRole.TEACHER),
      assistants: byRole(UserRole.ASSISTANT),
      students: byRole(UserRole.STUDENT),
      courses,
    };
  }

  async notifications(actor: CurrentUserPayload, since?: Date) {
    const payments = ADMIN_ROLES.includes(actor.role)
      ? await this.prisma.purchasedCourse.count({
          where: { status: PaymentStatus.PENDING },
        })
      : 0;

    const messages = await this.unreadMessages(actor, since);

    return { payments, messages, total: payments + messages };
  }

  private async unreadMessages(actor: CurrentUserPayload, since?: Date) {
    if (!since) return 0;

    const allowed = await this.owner.accessibleCourseIds(actor);

    if (allowed && allowed.length === 0) return 0;

    return this.prisma.chatMessage.count({
      where: {
        create_at: { gt: since },
        senderId: { not: actor.id },
        ...(allowed ? { courseId: { in: allowed } } : {}),
      },
    });
  }
}
