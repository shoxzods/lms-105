import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { QueryExamDto } from "./dto/query-exam.dto";
import { ExamStatus, Prisma, UserRole } from "@prisma/client";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { CheckExamDto } from "./dto/check-exam.dto";
import { QueryExamResultDto } from "./dto/query-exam-result.dto";

type ExamRow = { answer: string } & Record<string, unknown>;

function parseDateInput(str?: string): Date | null {
  if (!str) return null;
  const trimmed = str.trim();
  const dotParts = trimmed.split(".");
  if (dotParts.length === 3) {
    const day = parseInt(dotParts[0], 10);
    const month = parseInt(dotParts[1], 10) - 1;
    const year = parseInt(dotParts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;
  return null;
}

@Injectable()
export class ExamService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
  ) {}

  private hideAnswer<T extends ExamRow>(row: T, role?: UserRole) {
    if (role !== UserRole.STUDENT) return row;

    const { answer, ...rest } = row;

    return rest;
  }

  async create(payload: CreateExamDto, actor: Actor) {
    await this.owner.assertOwnsLesson(actor, payload.lessonId);

    const lesson = await this.prisma.lessons.findUnique({
      where: { id: payload.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson not found with this id=${payload.lessonId}`,
      );
    }

    const exam = await this.prisma.exam.create({
      data: payload,
      include: { lessons: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Exam created successfully!",
      data: exam,
    };
  }

  async check(payload: CheckExamDto, actor?: Actor) {
    const exams = await this.prisma.exam.findMany({
      where: { lessonId: payload.lessonId },
      orderBy: { id: "asc" },
    });

    if (exams.length === 0) {
      throw new NotFoundException(
        `Exam not found with this lessonId=${payload.lessonId}`,
      );
    }

    const given = new Map(payload.answers.map((a) => [a.examId, a.answer]));

    const details = exams.map((exam) => {
      const chosen = given.get(exam.id) ?? null;
      const isCorrect = chosen === exam.answer;
      return {
        examId: exam.id,
        question: exam.question,
        variantA: exam.variantA,
        variantB: exam.variantB,
        variantC: exam.variantC,
        variantD: exam.variantD,
        chosenAnswer: chosen,
        correctAnswer: exam.answer,
        isCorrect,
      };
    });

    const total = exams.length;
    const correct = details.filter((r) => r.isCorrect).length;
    const wrong = total - correct;
    const percent = Math.round((correct / total) * 100);
    const status = percent >= 70 ? ExamStatus.PASSED : ExamStatus.FAILED;

    let resultId: number | undefined;

    if (actor?.id) {
      const savedResult = await this.prisma.examResult.create({
        data: {
          userId: actor.id,
          lessonId: payload.lessonId,
          totalQuestions: total,
          correctAnswers: correct,
          wrongAnswers: wrong,
          percentage: percent,
          status,
          details: details as unknown as Prisma.InputJsonValue,
        },
      });
      resultId = savedResult.id;
    }

    return {
      success: true,
      message:
        status === ExamStatus.PASSED
          ? "Imtihon muvaffaqiyatli topshirildi!"
          : "Imtihondan o'ta olmadingiz",
      data: {
        id: resultId,
        total,
        correct,
        wrong,
        percent,
        status,
        passed: status === ExamStatus.PASSED,
        statusLabel: status === ExamStatus.PASSED ? "O'tgan" : "O'tmagan",
        results: details.map((d) => ({
          examId: d.examId,
          question: d.question,
          chosenAnswer: d.chosenAnswer,
          correctAnswer: d.correctAnswer,
          isCorrect: d.isCorrect,
        })),
      },
    };
  }

  async findAll(query: QueryExamDto, actor: Actor) {
    const { page = 1, limit = 10, search, lessonId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ExamWhereInput = {};

    if (lessonId) {
      where.lessonId = lessonId;
    } else {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) {
        where.lessons = { sections: { courseId: { in: allowed } } };
      }
    }

    if (search) {
      where.question = { contains: search, mode: "insensitive" };
    }

    const [exams, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: { lessons: { select: { id: true, name: true } } },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      success: true,
      data: exams.map((exam) => this.hideAnswer(exam, actor?.role)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, actor: Actor) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { lessons: { select: { id: true, name: true } } },
    });

    if (!exam) {
      throw new NotFoundException(`Exam not found with this id=${id}`);
    }

    return {
      success: true,
      data: this.hideAnswer(exam, actor?.role),
    };
  }

  async update(id: number, payload: UpdateExamDto, actor: Actor) {
    const exist = await this.prisma.exam.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Exam not found with this id=${id}`);
    }

    await this.owner.assertOwnsLesson(actor, exist.lessonId);

    if (payload.lessonId) {
      await this.owner.assertOwnsLesson(actor, payload.lessonId);

      const lesson = await this.prisma.lessons.findUnique({
        where: { id: payload.lessonId },
      });

      if (!lesson) {
        throw new NotFoundException(
          `Lesson not found with this id=${payload.lessonId}`,
        );
      }
    }

    const exam = await this.prisma.exam.update({
      where: { id },
      data: payload,
      include: { lessons: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Exam updated successfully!",
      data: exam,
    };
  }

  async remove(id: number, actor: Actor) {
    const exist = await this.prisma.exam.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Exam not found with this id=${id}`);
    }

    await this.owner.assertOwnsLesson(actor, exist.lessonId);

    await this.prisma.exam.delete({ where: { id } });

    return {
      success: true,
      message: "Exam deleted successfully!",
    };
  }

  // ==================== RESULTS MANAGEMENT ====================

  async findAllResults(query: QueryExamResultDto, actor: Actor) {
    const {
      page = 1,
      limit = 10,
      search,
      courseId,
      sectionId,
      lessonId,
      status,
      startDate,
      endDate,
      dateRange,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ExamResultWhereInput = {};

    if (actor.role === UserRole.TEACHER) {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) {
        where.lesson = {
          sections: {
            courseId: { in: allowed },
          },
        };
      }
    }

    if (lessonId) {
      where.lessonId = lessonId;
    } else if (sectionId) {
      where.lesson = {
        ...(where.lesson as Prisma.LessonsWhereInput),
        sectionId,
      };
    } else if (courseId) {
      where.lesson = {
        ...(where.lesson as Prisma.LessonsWhereInput),
        sections: {
          courseId,
        },
      };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { full_name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    let start: Date | null = null;
    let end: Date | null = null;

    if (dateRange && dateRange.includes("-")) {
      const [startPart, endPart] = dateRange.split("-");
      start = parseDateInput(startPart);
      end = parseDateInput(endPart);
    } else {
      if (startDate) start = parseDateInput(startDate);
      if (endDate) end = parseDateInput(endDate);
    }

    if (start || end) {
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      where.create_at = {
        ...(start && { gte: start }),
        ...(end && { lte: end }),
      };
    }

    const [results, total, passedCount, failedCount] =
      await this.prisma.$transaction([
        this.prisma.examResult.findMany({
          where,
          skip,
          take: limit,
          orderBy: { create_at: "desc" },
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
                image: true,
                file: true,
              },
            },
            lesson: {
              select: {
                id: true,
                name: true,
                sections: {
                  select: {
                    id: true,
                    name: true,
                    courses: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.examResult.count({ where }),
        this.prisma.examResult.count({
          where: { ...where, status: ExamStatus.PASSED },
        }),
        this.prisma.examResult.count({
          where: { ...where, status: ExamStatus.FAILED },
        }),
      ]);

    const formatted = results.map((r) => ({
      id: r.id,
      student: {
        id: r.user.id,
        fullName: r.user.full_name,
        phone: r.user.phone,
        email: r.user.email,
        image: r.user.image || r.user.file,
      },
      course: {
        id: r.lesson.sections.courses.id,
        name: r.lesson.sections.courses.name,
      },
      section: {
        id: r.lesson.sections.id,
        name: r.lesson.sections.name,
      },
      lesson: {
        id: r.lesson.id,
        name: r.lesson.name,
      },
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      wrongAnswers: r.wrongAnswers,
      percentage: r.percentage,
      status: r.status,
      statusLabel: r.status === ExamStatus.PASSED ? "O'tgan" : "O'tmagan",
      create_at: r.create_at,
    }));

    return {
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        passedCount,
        failedCount,
      },
    };
  }

  async findMyResults(query: QueryExamResultDto, actor: Actor) {
    const { page = 1, limit = 10, lessonId, courseId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ExamResultWhereInput = {
      userId: actor.id,
    };

    if (lessonId) {
      where.lessonId = lessonId;
    } else if (courseId) {
      where.lesson = {
        sections: {
          courseId,
        },
      };
    }

    const [results, total] = await this.prisma.$transaction([
      this.prisma.examResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          lesson: {
            select: {
              id: true,
              name: true,
              sections: {
                select: {
                  id: true,
                  name: true,
                  courses: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.examResult.count({ where }),
    ]);

    const formatted = results.map((r) => ({
      id: r.id,
      course: {
        id: r.lesson.sections.courses.id,
        name: r.lesson.sections.courses.name,
      },
      section: {
        id: r.lesson.sections.id,
        name: r.lesson.sections.name,
      },
      lesson: {
        id: r.lesson.id,
        name: r.lesson.name,
      },
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      wrongAnswers: r.wrongAnswers,
      percentage: r.percentage,
      status: r.status,
      statusLabel: r.status === ExamStatus.PASSED ? "O'tgan" : "O'tmagan",
      create_at: r.create_at,
    }));

    return {
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneResult(id: number, actor: Actor) {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            image: true,
            file: true,
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
            sections: {
              select: {
                id: true,
                name: true,
                courses: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Result not found with id=${id}`);
    }

    if (actor.role === UserRole.STUDENT && result.userId !== actor.id) {
      throw new ForbiddenException("Siz faqat o'z natijangizni ko'ra olasiz");
    }

    if (actor.role === UserRole.TEACHER) {
      const allowed = await this.owner.accessibleCourseIds(actor);
      const courseId = result.lesson.sections.courses.id;
      if (allowed && !allowed.includes(courseId)) {
        throw new ForbiddenException("Bu natijani ko'rishga ruxsatingiz yo'q");
      }
    }

    return {
      success: true,
      data: {
        id: result.id,
        student: {
          id: result.user.id,
          fullName: result.user.full_name,
          phone: result.user.phone,
          email: result.user.email,
          image: result.user.image || result.user.file,
        },
        course: {
          id: result.lesson.sections.courses.id,
          name: result.lesson.sections.courses.name,
        },
        section: {
          id: result.lesson.sections.id,
          name: result.lesson.sections.name,
        },
        lesson: {
          id: result.lesson.id,
          name: result.lesson.name,
        },
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        percentage: result.percentage,
        status: result.status,
        statusLabel: result.status === ExamStatus.PASSED ? "O'tgan" : "O'tmagan",
        details: result.details,
        create_at: result.create_at,
      },
    };
  }

  async getResultStats(actor: Actor) {
    const where: Prisma.ExamResultWhereInput = {};

    if (actor.role === UserRole.TEACHER) {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) {
        where.lesson = {
          sections: {
            courseId: { in: allowed },
          },
        };
      }
    }

    const [totalAttempts, passedAttempts, failedAttempts] =
      await Promise.all([
        this.prisma.examResult.count({ where }),
        this.prisma.examResult.count({
          where: { ...where, status: ExamStatus.PASSED },
        }),
        this.prisma.examResult.count({
          where: { ...where, status: ExamStatus.FAILED },
        }),
      ]);

    const passRate =
      totalAttempts > 0
        ? Math.round((passedAttempts / totalAttempts) * 100)
        : 0;

    return {
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passRate,
      },
    };
  }

  async removeResult(id: number, actor: Actor) {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException(`Result not found with id=${id}`);
    }

    if (
      actor.role !== UserRole.SUPERADMIN &&
      actor.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException("Natijani o'chirishga ruxsat yo'q");
    }

    await this.prisma.examResult.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Result deleted successfully!",
    };
  }
}

