import { ForbiddenException, Injectable } from "@nestjs/common";
import { PaymentStatus, UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";

export interface Actor {
  id: number;
  role: UserRole;
}

@Injectable()
export class CourseOwner {
  constructor(private prisma: PrismaService) {}

  /** User.id dan MentorProfile.id ni topadi */
  async mentorProfileId(userId: number) {
    const profile = await this.prisma.mentorProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException("Sizda mentor profili yo'q");
    }

    return profile.id;
  }

  async accessibleCourseIds(actor: Actor): Promise<number[] | null> {
    if (actor.role === UserRole.TEACHER) {
      const profile = await this.prisma.mentorProfile.findFirst({
        where: { userId: actor.id },
        select: { id: true },
      });

      if (!profile) return [];

      const courses = await this.prisma.courses.findMany({
        where: { mentorId: profile.id },
        select: { id: true },
      });

      return courses.map((c) => c.id);
    }

    if (actor.role === UserRole.ASSISTANT) {
      const courses = await this.prisma.courses.findMany({
        where: { assistantId: actor.id },
        select: { id: true },
      });

      return courses.map((c) => c.id);
    }

    if (actor.role === UserRole.STUDENT) {
      const purchases = await this.prisma.purchasedCourse.findMany({
        where: { userId: actor.id, status: PaymentStatus.COMPLETED },
        select: { courseId: true },
      });

      return purchases.map((p) => p.courseId);
    }

    return null;
  }

  async courseIdOfSection(sectionId: number) {
    const section = await this.prisma.sections.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });

    if (!section) throw new ForbiddenException("Bo'lim topilmadi");
    return section.courseId;
  }

  async courseIdOfLesson(lessonId: number) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id: lessonId },
      select: { sections: { select: { courseId: true } } },
    });

    if (!lesson) throw new ForbiddenException("Dars topilmadi");
    return lesson.sections.courseId;
  }

  /** Mentor bo'lmasa hech narsa tekshirmaydi */
  async assertOwnsCourse(actor: Actor, courseId: number) {
    if (actor.role !== UserRole.TEACHER) return;

    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
      select: { mentorId: true },
    });

    if (!course) throw new ForbiddenException("Kurs topilmadi");

    const myId = await this.mentorProfileId(actor.id);

    if (course.mentorId !== myId) {
      throw new ForbiddenException("Bu kurs sizga tegishli emas");
    }
  }

  async assertOwnsSection(actor: Actor, sectionId: number) {
    if (actor.role !== UserRole.TEACHER) return;

    await this.assertOwnsCourse(actor, await this.courseIdOfSection(sectionId));
  }

  async assertOwnsLesson(actor: Actor, lessonId: number) {
    if (actor.role !== UserRole.TEACHER) return;

    await this.assertOwnsCourse(actor, await this.courseIdOfLesson(lessonId));
  }
}
