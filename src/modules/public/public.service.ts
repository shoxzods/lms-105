import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { QueryPublicCourseDto } from "./dto/query-public-course.dto";

const courseCard = {
  id: true,
  name: true,
  description: true,
  banner: true,
  price: true,
  level: true,
  create_at: true,
  categories: { select: { id: true, name: true } },
  mentorProfile: {
    select: {
      id: true,
      job: true,
      user: { select: { id: true, full_name: true, file: true } },
    },
  },
};

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async courses(query: QueryPublicCourseDto) {
    const { page = 1, limit = 12, search, categoryId, level } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CoursesWhereInput = { published: true };

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
        select: courseCard,
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

  async courseById(id: number) {
    const course = await this.prisma.courses.findFirst({
      where: { id, published: true },
      select: {
        ...courseCard,
        intro_video: true,
        sections: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            name: true,
            _count: { select: { lessons: true } },
            lessons: { orderBy: { id: "asc" }, select: { id: true, name: true } },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course not found with this id=${id}`);
    }

    return { success: true, data: course };
  }

  async categories() {
    const categories = await this.prisma.categories.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { courses: true } },
      },
    });

    return { success: true, data: categories };
  }

  async mentors() {
    const mentors = await this.prisma.user.findMany({
      where: { role: UserRole.TEACHER, mentorProfile: { some: {} } },
      orderBy: { create_at: "desc" },
      select: {
        id: true,
        full_name: true,
        file: true,
        image: true,
        mentorProfile: {
          select: {
            job: true,
            experience: true,
            description: true,
            facebook: true,
            telegram: true,
            linkedin: true,
            instagram: true,
            github: true,
          },
        },
      },
    });

    return { success: true, data: mentors };
  }
}
