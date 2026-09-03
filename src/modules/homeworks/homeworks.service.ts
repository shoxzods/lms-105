import { Injectable, NotFoundException } from "@nestjs/common";
import { FileCleanup } from "src/common/services/file-cleanup.service";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { QueryHomeworkDto } from "./dto/query-homework.dto";
import { Prisma } from "@prisma/client";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";

@Injectable()
export class HomeworksService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
    private files: FileCleanup,
  ) {}

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
}
