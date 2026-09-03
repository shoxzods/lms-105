import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { FileCleanup } from "src/common/services/file-cleanup.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { Prisma, UserRole } from "@prisma/client";
import { QueryCourseDto } from "./dto/query-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

interface Actor {
  id: number;
  role: UserRole;
}

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private files: FileCleanup,
  ) {}

  /** Token egasining MentorProfile.id si */
  private async myMentorProfileId(actor: Actor) {
    const profile = await this.prisma.mentorProfile.findFirst({
      where: { userId: actor.id },
    });

    if (!profile) {
      throw new ForbiddenException("Sizda mentor profili yo'q");
    }

    return profile.id;
  }

  /** Kurs yaratilayotganda mentorId ni kim belgilashini hal qiladi */
  private async resolveMentorId(actor: Actor, mentorId?: number) {
    if (actor.role === UserRole.TEACHER) {
      return this.myMentorProfileId(actor);
    }

    if (!mentorId) {
      throw new BadRequestException("mentorId majburiy");
    }

    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException(
        `Mentor profile not found with this id=${mentorId}`,
      );
    }

    return mentorId;
  }

  /** Mentor faqat o'zining kursiga tegishi mumkin */
  private async assertOwnCourse(actor: Actor, courseMentorId: number) {
    if (actor.role !== UserRole.TEACHER) return;

    const myId = await this.myMentorProfileId(actor);

    if (courseMentorId !== myId) {
      throw new ForbiddenException("Bu kurs sizga tegishli emas");
    }
  }

  async create(
    payload: CreateCourseDto,
    banner: string,
    intro_video: string,
    actor: Actor,
  ) {
    const mentorId = await this.resolveMentorId(actor, payload.mentorId);

    const exist = await this.prisma.courses.findUnique({
      where: { name: payload.name },
    });

    if (exist) {
      throw new ConflictException("Course already exists with this name");
    }

    const category = await this.prisma.categories.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category not found with this id=${payload.categoryId}`,
      );
    }

    if (payload.assistantId) {
      const assistant = await this.prisma.user.findUnique({
        where: { id: payload.assistantId },
      });

      if (!assistant || assistant.role !== UserRole.ASSISTANT) {
        throw new NotFoundException(
          `Assistant not found with this id=${payload.assistantId}`,
        );
      }
    }

    const course = await this.prisma.courses.create({
      data: {
        ...payload,
        mentorId,
        banner,
        intro_video,
      },
      include: {
        categories: true,
        mentorProfile: {
          include: {
            user: { select: { id: true, full_name: true, phone: true } },
          },
        },
      },
    });

    return {
      success: true,
      message: "Course created successfully!",
      data: course,
    };
  }

  async findAll(query: QueryCourseDto, actor: Actor) {
    const { page = 1, limit = 10, search, categoryId, level } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CoursesWhereInput = {};

    if (actor.role === UserRole.TEACHER) {
      where.mentorId = await this.myMentorProfileId(actor);
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await this.prisma.$transaction([
      this.prisma.courses.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          categories: true,
          mentorProfile: {
            include: {
              user: { select: { id: true, full_name: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.courses.count({ where }),
    ]);

    return {
      success: true,
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, actor: Actor) {
    const course = await this.prisma.courses.findUnique({
      where: { id },
      include: {
        categories: true,
        mentorProfile: {
          include: {
            user: { select: { id: true, full_name: true, phone: true } },
          },
        },
        user: { select: { id: true, full_name: true, phone: true } },
        sections: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course not found with this id=${id}`);
    }

    await this.assertOwnCourse(actor, course.mentorId);

    return {
      success: true,
      data: course,
    };
  }

  async update(
    id: number,
    payload: UpdateCourseDto,
    banner: string | undefined,
    intro_video: string | undefined,
    actor: Actor,
  ) {
    const exist = await this.prisma.courses.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Course not found with this id=${id}`);
    }

    await this.assertOwnCourse(actor, exist.mentorId);

    const { mentorId, ...rest } = payload;

    if (mentorId && actor.role === UserRole.TEACHER) {
      throw new ForbiddenException("Mentorni faqat admin almashtiradi");
    }

    if (payload.name) {
      const duplicate = await this.prisma.courses.findFirst({
        where: {
          name: payload.name,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException("Courses already exists with this name");
      }
    }

    if (payload.categoryId) {
      const category = await this.prisma.categories.findUnique({
        where: { id: payload.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category not found with this id=${payload.categoryId}`,
        );
      }
    }

    if (mentorId) {
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { id: mentorId },
      });

      if (!mentor) {
        throw new NotFoundException(
          `Mentor profile not found with this id=${mentorId}`,
        );
      }
    }

    if (payload.assistantId) {
      const assistant = await this.prisma.user.findUnique({
        where: { id: payload.assistantId },
      });

      if (!assistant || assistant.role !== UserRole.ASSISTANT) {
        throw new NotFoundException(
          `Assistant not found with this id=${payload.assistantId}`,
        );
      }
    }

    const course = await this.prisma.courses.update({
      where: { id },
      data: {
        ...rest,
        ...(mentorId && { mentorId }),
        ...(banner && { banner }),
        ...(intro_video && { intro_video }),
      },
      include: {
        categories: true,
        mentorProfile: {
          include: {
            user: { select: { id: true, full_name: true, phone: true } },
          },
        },
      },
    });

    return {
      success: true,
      message: "Course update successfully!",
      data: course,
    };
  }

  async remove(id: number) {
    const exist = await this.prisma.courses.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Course not found with this id=${id}`);
    }

    const sectionsCount = await this.prisma.sections.count({
      where: { courseId: id },
    });

    if (sectionsCount > 0) {
      throw new BadRequestException(
        `This course has ${sectionsCount} section(s). Delete them first.`,
      );
    }

    await this.prisma.courses.delete({ where: { id } });

    await this.files.remove("images", exist.banner);
    await this.files.remove("videos", exist.intro_video);

    return {
      success: true,
      message: "Course deleted successfully!",
    };
  }
}
