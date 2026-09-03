import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FileCleanup } from "src/common/services/file-cleanup.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { PrismaService } from "src/core/database/prisma.service";
import { QueryLessonDto } from "./dto/query-lesson.dto";
import { Prisma } from "@prisma/client";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
    private files: FileCleanup,
  ) {}

  async create(payload: CreateLessonDto, file: string, actor: Actor) {
    const section = await this.prisma.sections.findUnique({
      where: { id: payload.sectionId },
    });

    if (!section) {
      throw new NotFoundException(
        `Section not found with this id=${payload.sectionId}`,
      );
    }

    await this.owner.assertOwnsSection(actor, payload.sectionId);

    const exist = await this.prisma.lessons.findUnique({
      where: { name: payload.name },
    });

    if (exist) {
      throw new ConflictException("Lesson already exists with this name");
    }

    const lesson = await this.prisma.lessons.create({
      data: { ...payload, file },
      include: { sections: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Lesson created successfully!",
      data: lesson,
    };
  }

  async findAll(query: QueryLessonDto, actor: Actor) {
    const { page = 1, limit = 10, search, sectionId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonsWhereInput = {};

    if (sectionId) {
      where.sectionId = sectionId;
    } else {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) where.sections = { courseId: { in: allowed } };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [lessons, total] = await this.prisma.$transaction([
      this.prisma.lessons.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          sections: { select: { id: true, name: true } },
          _count: {
            select: { materials: true, homeworks: true, exams: true },
          },
        },
      }),
      this.prisma.lessons.count({ where }),
    ]);

    return {
      success: true,
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id },
      include: {
        sections: { select: { id: true, name: true } },
        materials: { include: { materialFiles: true } },
        homeworks: true,
        exams: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson not found with this id=${id}`);
    }

    return {
      success: true,
      data: lesson,
    };
  }

  async update(
    id: number,
    payload: UpdateLessonDto,
    actor: Actor,
    file?: string,
  ) {
    const exist = await this.prisma.lessons.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Lesson not found with this id=${id}`);
    }

    await this.owner.assertOwnsSection(actor, exist.sectionId);

    if (payload.sectionId) {
      const section = await this.prisma.sections.findUnique({
        where: { id: payload.sectionId },
      });

      if (!section) {
        throw new NotFoundException(
          `Section not found with this id=${payload.sectionId}`,
        );
      }

      await this.owner.assertOwnsSection(actor, payload.sectionId);
    }

    if (payload.name) {
      const duplicate = await this.prisma.lessons.findFirst({
        where: { name: payload.name, NOT: { id } },
      });

      if (duplicate) {
        throw new ConflictException("Lesson already exists with this name");
      }
    }

    const lesson = await this.prisma.lessons.update({
      where: { id },
      data: {
        ...payload,
        ...(file && { file }),
      },
      include: { sections: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Lesson updated successfully!",
      data: lesson,
    };
  }

  async remove(id: number, actor: Actor) {
    const exist = await this.prisma.lessons.findUnique({
      where: { id },
      include: {
        _count: {
          select: { materials: true, homeworks: true, exams: true },
        },
      },
    });

    if (!exist) {
      throw new NotFoundException(`Lesson not found with this id=${id}`);
    }

    await this.owner.assertOwnsSection(actor, exist.sectionId);

    const { materials, homeworks, exams } = exist._count;

    if (materials > 0 || homeworks > 0 || exams > 0) {
      throw new BadRequestException(
        `This lesson has ${materials} material(s), ${homeworks} homework(s) and ${exams} exam(s). Delete them first`,
      );
    }

    await this.prisma.lessons.delete({ where: { id } });

    await this.files.remove("videos", exist.file);

    return {
      success: true,
      message: "Lesson deleted successfully!",
    };
  }
}
