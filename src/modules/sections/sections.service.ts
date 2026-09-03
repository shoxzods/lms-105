import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { QuerySectionDto } from "./dto/query-section.dto";
import { Prisma } from "@prisma/client";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
  ) {}

  async create(payload: CreateSectionDto, actor: Actor) {
    const course = await this.prisma.courses.findUnique({
      where: { id: payload.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course not found with this id=${payload.courseId}`,
      );
    }

    await this.owner.assertOwnsCourse(actor, payload.courseId);
    const exist = await this.prisma.sections.findUnique({
      where: { name: payload.name },
    });

    if (exist) {
      throw new ConflictException("Section already exists with this name");
    }

    const section = await this.prisma.sections.create({
      data: payload,
      include: { courses: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Section created successfully!",
      data: section,
    };
  }

  async findAll(query: QuerySectionDto, actor: Actor) {
    const { page = 1, limit = 10, search, courseId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SectionsWhereInput = {};

    if (courseId) {
      where.courseId = courseId;
    } else {
      const allowed = await this.owner.accessibleCourseIds(actor);
      if (allowed) where.courseId = { in: allowed };
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [sections, total] = await this.prisma.$transaction([
      this.prisma.sections.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          courses: { select: { id: true, name: true } },
          _count: { select: { lessons: true } },
        },
      }),
      this.prisma.sections.count({ where }),
    ]);

    return {
      success: true,
      data: sections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const section = await this.prisma.sections.findUnique({
      where: { id },
      include: { courses: { select: { id: true, name: true } }, lessons: true },
    });

    if (!section) {
      throw new NotFoundException(`Section not found with this id=${id}`);
    }

    return {
      success: true,
      data: section,
    };
  }

  async update(id: number, payload: UpdateSectionDto, actor: Actor) {
    const exist = await this.prisma.sections.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Section not found with this id=${id}`);
    }

    await this.owner.assertOwnsCourse(actor, exist.courseId);

    if (payload.courseId) {
      const course = await this.prisma.courses.findUnique({
        where: { id: payload.courseId },
      });

      if (!course) {
        throw new NotFoundException(
          `Course not found with this id=${payload.courseId}`,
        );
      }

      await this.owner.assertOwnsCourse(actor, payload.courseId);
    }

    if (payload.name) {
      const duplicate = await this.prisma.sections.findFirst({
        where: { name: payload.name, NOT: { id } },
      });

      if (duplicate) {
        throw new ConflictException("Section already exists with this name");
      }
    }

    const section = await this.prisma.sections.update({
      where: { id },
      data: payload,
      include: { courses: { select: { id: true, name: true } } },
    });

    return {
      success: true,
      message: "Section updated successfully!",
      data: section,
    };
  }

  async remove(id: number, actor: Actor) {
    const exist = await this.prisma.sections.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Section not found with this id=${id}`);
    }

    await this.owner.assertOwnsCourse(actor, exist.courseId);

    const lessonsCount = await this.prisma.lessons.count({
      where: { sectionId: id },
    });

    if (lessonsCount > 0) {
      throw new BadRequestException(
        `This section has ${lessonsCount} lesson(s). Delete them first.`,
      );
    }

    await this.prisma.sections.delete({ where: { id } });

    return {
      success: true,
      message: "Section deleted successfully!",
    };
  }
}
