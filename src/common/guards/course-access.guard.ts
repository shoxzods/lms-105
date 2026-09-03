import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "src/core/database/prisma.service";
import { COURSE_ACCESS_KEY, CourseSource } from "../decorators/course-access";
import { PaymentStatus, UserRole } from "@prisma/client";
import { Actor, CourseOwner } from "../services/course-owner.service";

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private owner: CourseOwner,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const source = this.reflector.get<CourseSource>(
      COURSE_ACCESS_KEY,
      context.getHandler(),
    );

    if (!source) return true;

    const req = context.switchToHttp().getRequest();
    const user: Actor | undefined = req.user;

    if (!user) return true;

    const CHECKED_ROLES: UserRole[] = [UserRole.STUDENT, UserRole.TEACHER];
    if (!CHECKED_ROLES.includes(user.role)) return true;

    const id = this.readId(source, req);

    if (id === null) return true;

    const courseId = await this.resolveCourseId(source, id);

    if (user.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(user, courseId);
      return true;
    }

    const purchase = await this.prisma.purchasedCourse.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    if (purchase?.status !== PaymentStatus.COMPLETED) {
      throw new ForbiddenException(
        "Bu kursga kirish uchun to'lov tasdiqlanishi kerak",
      );
    }

    return true;
  }

  /** So'rovdan manbaning id sini oladi: /:sectionId, ?sectionId= yoki /:id */
  private readId(source: CourseSource, req: any): number | null {
    const raw =
      req.params?.[`${source}Id`] ??
      req.query?.[`${source}Id`] ??
      req.body?.[`${source}Id`] ??
      req.params?.id;

    if (raw === undefined || raw === null || raw === "") return null;

    const id = Number(raw);

    if (!Number.isInteger(id) || id < 1) {
      throw new ForbiddenException("Noto'g'ri id yuborildi");
    }

    return id;
  }

  private async resolveCourseId(
    source: CourseSource,
    id: number,
  ): Promise<number> {
    if (source === "course") return id;

    if (source === "section") return this.owner.courseIdOfSection(id);

    const lessonId =
      source === "lesson" ? id : await this.resolveLessonId(source, id);

    return this.owner.courseIdOfLesson(lessonId);
  }

  /** Material, vazifa yoki test id sidan dars id sini topadi */
  private async resolveLessonId(
    source: CourseSource,
    id: number,
  ): Promise<number> {
    if (source === "material") {
      const material = await this.prisma.materials.findUnique({
        where: { id },
        select: { lessonId: true },
      });

      if (!material) throw new ForbiddenException("Material topilmadi");
      return material.lessonId;
    }

    if (source === "homework") {
      const homework = await this.prisma.homeworks.findUnique({
        where: { id },
        select: { lessonId: true },
      });

      if (!homework) throw new ForbiddenException("Vazifa topilmadi");
      return homework.lessonId;
    }

    const exam = await this.prisma.exam.findUnique({
      where: { id },
      select: { lessonId: true },
    });

    if (!exam) throw new ForbiddenException("Test topilmadi");
    return exam.lessonId;
  }
}
