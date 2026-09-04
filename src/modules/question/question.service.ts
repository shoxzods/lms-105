import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, QuestionStatus, UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";
import { QueryQuestionDto } from "./dto/query-question.dto";

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

const courseSelect = {
  select: { id: true, name: true },
};

const sectionSelect = {
  select: { id: true, name: true },
};

const lessonSelect = {
  select: { id: true, name: true },
};

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly owner: CourseOwner,
  ) {}

  async create(userId: number, dto: CreateQuestionDto, fileName?: string) {
    const course = await this.prisma.courses.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException("Kurs topilmadi");
    }

    return this.prisma.question.create({
      data: {
        userId,
        courseId: dto.courseId,
        sectionId: dto.sectionId ?? null,
        lessonId: dto.lessonId ?? null,
        question: dto.question,
        file: fileName ?? null,
        status: QuestionStatus.PENDING,
      },
      include: {
        user: userSelect,
        course: courseSelect,
        section: sectionSelect,
        lesson: lessonSelect,
      },
    });
  }

  async answer(id: number, actor: Actor, dto: AnswerQuestionDto, answerFileName?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!question) {
      throw new NotFoundException("Savol topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, question.courseId);
    } else if (actor.role === UserRole.ASSISTANT) {
      if (question.course.assistantId !== actor.id) {
        throw new ForbiddenException("Siz bu kursga biriktirilmagansiz");
      }
    } else if (actor.role === UserRole.STUDENT) {
      throw new ForbiddenException("Talaba savolga javob bera olmaydi");
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: {
        answer: dto.answer,
        answerFile: answerFileName ?? question.answerFile,
        status: QuestionStatus.ANSWERED,
      },
      include: {
        user: userSelect,
        course: courseSelect,
        section: sectionSelect,
        lesson: lessonSelect,
      },
    });

    try {
      await this.prisma.chatMessage.create({
        data: {
          courseId: question.courseId,
          senderId: actor.id,
          text: `Javob: ${dto.answer}`,
        },
      });
    } catch {
      // Ignore if chat creation fails
    }

    return updated;
  }

  async findAll(actor: Actor, query: QueryQuestionDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {};

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.create_at = {};
      if (query.from) {
        where.create_at.gte = new Date(query.from);
      }
      if (query.to) {
        const endDate = new Date(query.to);
        endDate.setHours(23, 59, 59, 999);
        where.create_at.lte = endDate;
      }
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
        { user: { full_name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Role-based scoping
    if (actor.role === UserRole.TEACHER) {
      const mentorProfileId = await this.owner.mentorProfileId(actor.id);
      where.course = { mentorId: mentorProfileId };
    } else if (actor.role === UserRole.ASSISTANT) {
      where.course = { assistantId: actor.id };
    } else if (actor.role === UserRole.STUDENT) {
      where.userId = actor.id;
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          user: userSelect,
          course: courseSelect,
          section: sectionSelect,
          lesson: lessonSelect,
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number, actor: Actor) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        user: userSelect,
        course: courseSelect,
        section: sectionSelect,
        lesson: lessonSelect,
      },
    });

    if (!question) {
      throw new NotFoundException("Savol topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, question.courseId);
    } else if (actor.role === UserRole.STUDENT) {
      if (question.userId !== actor.id) {
        throw new ForbiddenException("Siz faqat o'z savolingizni ko'ra olasiz");
      }
    }

    return question;
  }

  async remove(id: number, actor: Actor) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException("Savol topilmadi");
    }

    if (actor.role === UserRole.TEACHER) {
      await this.owner.assertOwnsCourse(actor, question.courseId);
    } else if (actor.role === UserRole.STUDENT && question.userId !== actor.id) {
      throw new ForbiddenException("Siz faqat o'z savolingizni o'chira olasiz");
    }

    return this.prisma.question.delete({ where: { id } });
  }
}
