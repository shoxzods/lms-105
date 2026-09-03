import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { QueryCategoryDto } from "./dto/query-category.dto";
import { Prisma } from "@prisma/client";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateCategoryDto) {
    const exist = await this.prisma.categories.findUnique({
      where: { name: payload.name },
    });

    if (exist) {
      throw new ConflictException("Category already exists with this name");
    }

    const category = await this.prisma.categories.create({
      data: payload,
    });

    return {
      success: true,
      message: "Category created successfully!",
      data: category,
    };
  }

  async findAll(query: QueryCategoryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoriesWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.categories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
      }),
      this.prisma.categories.count({ where }),
    ]);

    return {
      success: true,
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with this id=${id}`);
    }

    return {
      success: true,
      data: category,
    };
  }

  async update(id: number, payload: UpdateCategoryDto) {
    const exist = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException(`Category not found with this id=${id}`);
    }

    if (payload.name) {
      const duplicate = await this.prisma.categories.findFirst({
        where: {
          name: payload.name,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException("Category already exists with this name");
      }
    }

    const category = await this.prisma.categories.update({
      where: { id },
      data: payload,
    });

    return {
      success: true,
      message: "Category updated successfully!",
      data: category,
    };
  }

  async remove(id: number) {
    const exist = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException(`Category not found with this id=${id}`);
    }

    const coursesCount = await this.prisma.courses.count({
      where: { categoryId: id },
    });

    if (coursesCount > 0) {
      throw new BadRequestException(
        `This category has ${coursesCount} course(s). Delete or move them first.`,
      );
    }

    await this.prisma.categories.delete({ where: { id } });

    return {
      success: true,
      message: "Category deleted successfully!",
    };
  }
}
