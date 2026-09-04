import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FileCleanup } from "src/common/services/file-cleanup.service";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { QueryHomeworkDto } from "./dto/query-homework.dto";
import { Prisma, SubmissionStatus, UserRole } from "@prisma/client";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";
import { SubmitHomeworkDto } from "./dto/submit-homework.dto";
import { GradeSubmissionDto } from "./dto/grade-submission.dto";
import { QuerySubmissionDto } from "./dto/query-submission.dto";

const userSelect = {
  select: {
    id: true,
    full_name: true,
    image: true,
    file: true,
    email: true,
    role: true,
  },
};

const lessonSelect = {
  select: {
    id: true,
    name: true,
  },
};

const courseSelect = {
  select: {
    id: true,
    name: true,
  },
};

const homeworkSelect = {
  select: {
    id: true,
    description: true,
    file: true,
  },
};

@Injectable()
export class HomeworksService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
    private files: FileCleanup,
  ) {}

  /* ==================== Homeworks (Vazifa yaratish/boshqarish) ==================== */

  async create(payload: CreateHomeworkDto, actor: Actor, file?: string) {
    await this.owner.assertOwnsLesson(actor, payload.lessonId);

    const lesson = await this.prisma.lessons.findUnique({
      where: { id: payload.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson not found with this id=${payload.lessonId}`,
      );
    }

    const homework = await this.prisma.homeworks.create({
      data: { ...payload, file: file ?? null },
      include: { lessons: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Homework created successfully!",
      data: homework,
    };
  }

  async findAll(query: QueryHomeworkDto, actor: Actor) {
    const { page = 1, limit = 10, search, lessonId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.HomeworksWhereInput = {};

    if (lessonId) {
      where.lessonId = lessonId;
    } else {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) {
        where.lessons = { sections: { courseId: { in: allowed } } };
      }
    }

    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const [homeworks, total] = await this.prisma.$transaction([
      this.prisma.homeworks.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: { lessons: { select: { id: true, name: true } } },
      }),
      this.prisma.homeworks.count({ where }),
    ]);

    return {
      success: true,
      data: homeworks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const homework = await this.prisma.homeworks.findUnique({
      where: { id },
      include: { lessons: { select: { id: true, name: true } } },
    });

    if (!homework) {
      throw new NotFoundException(`Homework not found with this id=${id}`);
    }

    return {
      success: true,
      data: homework,
    };
  }

  async update(
    id: number,
    payload: UpdateHomeworkDto,
    actor: Actor,
    file?: string,
  ) {
    const exist = await this.prisma.homeworks.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Homework not found with this id=${id}`);
    }

    await this.owner.assertOwnsLesson(actor, exist.lessonId);

    if (payload.lessonId) {
      const lesson = await this.prisma.lessons.findUnique({
        where: { id: payload.lessonId },
      });

      if (!lesson) {
        throw new NotFoundException(
          `Lesson not found with this id=${payload.lessonId}`,
        );
      }

      await this.owner.assertOwnsLesson(actor, payload.lessonId);
    }

    const homework = await this.prisma.homeworks.update({
      where: { id },
      data: {
        ...payload,
        ...(file && { file }),
      },
      include: { lessons: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Homework update successfully!",
      data: homework,
    };
  }

  async remove(id: number, actor: Actor) {
    const exist = await this.prisma.homeworks.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Homework not found with this id=${id}`);
    }

    await this.owner.assertOwnsLesson(actor, exist.lessonId);

    await this.prisma.homeworks.delete({ where: { id } });

    await this.files.remove("files", exist.file);

    return {
      success: true,
      message: "Homework deleted successfully!",
    };
  }

  /* ==================== Homework Submissions (Talaba topshirishi va Baholash) ==================== */

  /**
   * Talaba vazifa topshirishi (Submit homework)
   */
  async submit(userId: number, dto: SubmitHomeworkDto, fileName?: string) {
    const lessonId = Number(dto.lessonId);
    if (!lessonId || isNaN(lessonId)) {
      throw new BadRequestException("Dars ID-si noto'g'ri ko'rsatilgan");
    }

    const lesson = await this.prisma.lessons.findUnique({
      where: { id: lessonId },
      include: { sections: true },
    });

    if (!lesson) {
      throw new NotFoundException("Dars topilmadi");
    }

    const courseId = Number(
      dto.courseId ?? lesson.sections?.courseId ?? 0,
    );

    if (!courseId) {
      throw new BadRequestException("Kurs ID-sini aniqlab bo'lmadi");
    }

    let validHomeworkId: number | null = null;
    const rawHwId = dto.homeworkId ? Number(dto.homeworkId) : null;
    if (rawHwId && !isNaN(rawHwId)) {
      const hw = await this.prisma.homeworks.findUnique({
        where: { id: rawHwId },
      });
      if (hw) {
        validHomeworkId = hw.id;
      }
    }

    if (!validHomeworkId) {
      const firstHw = await this.prisma.homeworks.findFirst({
        where: { lessonId },
      });
      if (firstHw) {
        validHomeworkId = firstHw.id;
      }
    }

    const submission = await this.prisma.homeworkSubmission.create({
      data: {
        userId,
        lessonId,
        courseId,
        homeworkId: validHomeworkId,
        file: fileName ?? null,
        text: dto.text ?? null,
        status: SubmissionStatus.PENDING,
      },
      include: {
        user: userSelect,
        lesson: lessonSelect,
        course: courseSelect,
        homework: homeworkSelect,
      },
    });

    return {
      success: true,
      message: "Vazifa muvaffaqiyatli topshirildi",
      data: submission,
    };
  }

  /**
   * Talabaning o'z topshirgan vazifalari ro'yxati
   */
  async findMySubmissions(userId: number, lessonId?: number) {
    const where: Prisma.HomeworkSubmissionWhereInput = { userId };
    if (lessonId) {
      where.lessonId = Number(lessonId);
    }

    const submissions = await this.prisma.homeworkSubmission.findMany({
      where,
      orderBy: { create_at: "desc" },
      include: {
        lesson: lessonSelect,
        course: courseSelect,
        homework: homeworkSelect,
      },
    });

    return {
      success: true,
      data: submissions,
    };
  }

  /**
   * O'qituvchi / Admin uchun barcha topshirilgan vazifalar
   */
  async findSubmissions(actor: Actor, query: QuerySubmissionDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.HomeworkSubmissionWhereInput = {};

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.lessonId) {
      where.lessonId = query.lessonId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { user: { full_name: { contains: search, mode: "insensitive" } } },
        { lesson: { name: { contains: search, mode: "insensitive" } } },
        { course: { name: { contains: search, mode: "insensitive" } } },
        { text: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role-based scoping
    if (actor.role === UserRole.TEACHER) {
      const profile = await this.prisma.mentorProfile.findFirst({
        where: { userId: actor.id },
        select: { id: true },
      });
      if (profile) {
        where.course = { mentorId: profile.id };
      } else {
        where.id = -1;
      }
    } else if (actor.role === UserRole.ASSISTANT) {
      where.course = { assistantId: actor.id };
    }

    const [items, total] = await Promise.all([
      this.prisma.homeworkSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          user: userSelect,
          lesson: lessonSelect,
          course: courseSelect,
          homework: homeworkSelect,
        },
      }),
      this.prisma.homeworkSubmission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Bitta topshirilgan vazifani olish
   */
  async findOneSubmission(id: number, actor: Actor) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: {
        user: userSelect,
        lesson: lessonSelect,
        course: courseSelect,
        homework: homeworkSelect,
      },
    });

    if (!submission) {
      throw new NotFoundException("Topshirilgan vazifa topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, submission.courseId);
    } else if (actor.role === UserRole.STUDENT) {
      if (submission.userId !== actor.id) {
        throw new ForbiddenException("Siz faqat o'z vazifangizni ko'ra olasiz");
      }
    }

    return {
      success: true,
      data: submission,
    };
  }

  /**
   * O'qituvchi tomonidan vazifani baholash (Grade submission)
   */
  async gradeSubmission(
    id: number,
    actor: Actor,
    dto: GradeSubmissionDto,
    feedbackFileName?: string,
  ) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!submission) {
      throw new NotFoundException("Topshirilgan vazifa topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, submission.courseId);
    } else if (actor.role === UserRole.ASSISTANT) {
      if (submission.course.assistantId !== actor.id) {
        throw new ForbiddenException("Siz bu kursga biriktirilmagansiz");
      }
    } else if (actor.role === UserRole.STUDENT) {
      throw new ForbiddenException("Talaba vazifani baholay olmaydi");
    }

    const updated = await this.prisma.homeworkSubmission.update({
      where: { id },
      data: {
        score: dto.score,
        feedback: dto.feedback ?? null,
        feedbackFile: feedbackFileName ?? submission.feedbackFile,
        status: dto.status ?? SubmissionStatus.GRADED,
      },
      include: {
        user: userSelect,
        lesson: lessonSelect,
        course: courseSelect,
        homework: homeworkSelect,
      },
    });

    return {
      success: true,
      message: "Vazifa muvaffaqiyatli baholandi",
      data: updated,
    };
  }

  /**
   * Topshirilgan vazifani o'chirish
   */
  async removeSubmission(id: number, actor: Actor) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException("Topshirilgan vazifa topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, submission.courseId);
    } else if (
      actor.role === UserRole.STUDENT &&
      submission.userId !== actor.id
    ) {
      throw new ForbiddenException(
        "Siz faqat o'z vazifangizni o'chira olasiz",
      );
    }

    await this.prisma.homeworkSubmission.delete({ where: { id } });

    if (submission.file) {
      await this.files.remove("files", submission.file);
    }

    return {
      success: true,
      message: "Topshirilgan vazifa o'chirildi",
    };
  }
}
