import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { QueryExamDto } from "./dto/query-exam.dto";
import { Prisma, UserRole } from "@prisma/client";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { CheckExamDto } from "./dto/check-exam.dto";

type ExamRow = { answer: string } & Record<string, unknown>;

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

  async check(payload: CheckExamDto) {
    const exams = await this.prisma.exam.findMany({
      where: { lessonId: payload.lessonId },
      select: { id: true, answer: true },
    });

    if (exams.length === 0) {
      throw new NotFoundException(
        `Exam not found with this lessonId=${payload.lessonId}`,
      );
    }

    const given = new Map(payload.answers.map((a) => [a.examId, a.answer]));

    const results = exams.map((exam) => ({
      examId: exam.id,
      correct: given.get(exam.id) === exam.answer,
      correctAnswer: exam.answer,
    }));

    const correct = results.filter((r) => r.correct).length;

    return {
      success: true,
      data: {
        total: exams.length,
        correct,
        wrong: exams.length - correct,
        percent: Math.round((correct / exams.length) * 100),
        results,
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
}
