import { ForbiddenException, Injectable } from "@nestjs/common";
import { PaymentStatus, UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";

export const roomOf = (courseId: number) => `course:${courseId}`;

const senderSelect = {
  select: { id: true, full_name: true, role: true, file: true },
};

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
  ) {}

  async assertCanJoin(actor: Actor, courseId: number) {
    if (actor.role === UserRole.STUDENT) {
      const purchase = await this.prisma.purchasedCourse.findUnique({
        where: { userId_courseId: { userId: actor.id, courseId } },
      });

      if (purchase?.status !== PaymentStatus.COMPLETED) {
        throw new ForbiddenException(
          "Bu kursga kirish uchun to'lov tasdiqlanishi kerak",
        );
      }

      return;
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, courseId);
      return;
    }

    if (actor.role === UserRole.ASSISTANT) {
      const course = await this.prisma.courses.findUnique({
        where: { id: courseId },
        select: { assistantId: true },
      });

      if (course?.assistantId !== actor.id) {
        throw new ForbiddenException("Siz bu kursga biriktirilmagansiz");
      }

      return;
    }

    const staff: UserRole[] = [UserRole.SUPERADMIN, UserRole.ADMIN];

    if (!staff.includes(actor.role)) {
      throw new ForbiddenException("Ruxsat yo'q");
    }
  }

  async history(courseId: number, take = 50) {
    const rows = await this.prisma.chatMessage.findMany({
      where: { courseId },
      orderBy: { create_at: "desc" },
      take,
      include: { sender: senderSelect },
    });

    return rows.reverse();
  }

  async save(courseId: number, senderId: number, text: string) {
    const message = await this.prisma.chatMessage.create({
      data: { courseId, senderId, text },
      include: { sender: senderSelect },
    });

    if (message.sender.role === UserRole.STUDENT) {
      await this.prisma.question.create({
        data: {
          userId: senderId,
          courseId,
          question: text,
          status: "PENDING",
        },
      });
    }

    return message;
  }

  async rooms(actor: Actor) {
    if (actor.role === UserRole.STUDENT) {
      const purchases = await this.prisma.purchasedCourse.findMany({
        where: { userId: actor.id, status: PaymentStatus.COMPLETED },
        select: { courses: { select: { id: true, name: true, banner: true } } },
      });

      return this.withLastMessage(purchases.map((p) => p.courses));
    }

    const where =
      actor.role === UserRole.TEACHER
        ? { mentorId: await this.owner.mentorProfileId(actor.id) }
        : actor.role === UserRole.ASSISTANT
          ? { assistantId: actor.id }
          : {};

    const courses = await this.prisma.courses.findMany({
      where,
      select: { id: true, name: true, banner: true },
      orderBy: { create_at: "desc" },
    });

    return this.withLastMessage(courses);
  }

  private async withLastMessage(
    courses: { id: number; name: string; banner: string }[],
  ) {
    const last = await this.prisma.chatMessage.findMany({
      where: { courseId: { in: courses.map((c) => c.id) } },
      orderBy: { create_at: "desc" },
      include: { sender: senderSelect },
    });

    const seen = new Map<number, (typeof last)[number]>();

    for (const row of last) {
      if (!seen.has(row.courseId)) seen.set(row.courseId, row);
    }

    return courses.map((course) => ({
      ...course,
      lastMessage: seen.get(course.id) ?? null,
    }));
  }
}
