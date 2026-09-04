import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateAssistantDto } from "./dto/create-assistant.dto";
import { Prisma, UserRole } from "@prisma/client";
import hashPassword from "src/common/config/hash";
import { QueryAssistantDto } from "./dto/query-assistant.dto";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";
import { FileCleanup } from "src/common/services/file-cleanup.service";

const assistantSelect = {
  id: true,
  full_name: true,
  phone: true,
  email: true,
  role: true,
  file: true,
  status: true,
  create_at: true,
  courses: { select: { id: true, name: true } },
};

@Injectable()
export class AssistantService {
  constructor(
    private prisma: PrismaService,
    private files: FileCleanup,
  ) {}

  async create(payload: CreateAssistantDto, filename?: string) {
    const { courseId, ...userData } = payload;

    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      await this.files.remove("images", filename);

      throw new NotFoundException(`Course not found with this id=${courseId}`);
    }

    const exist = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: userData.phone }, { email: userData.email }],
      },
    });

    if (exist) {
      await this.files.remove("images", filename);

      throw new ConflictException(
        "User already exists with this phone or email",
      );
    }

    const assistant = await this.prisma.user.create({
      data: {
        ...userData,
        role: UserRole.ASSISTANT,
        password: await hashPassword(userData.password),
        file: filename || null,
        courses: { connect: { id: courseId } },
      },
      select: assistantSelect,
    });

    return {
      success: true,
      message: "Assistant created successfully!",
      data: assistant,
    };
  }

  async findAll(query: QueryAssistantDto) {
    const { page = 1, limit = 10, search, courseId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { role: UserRole.ASSISTANT };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (courseId) {
      where.courses = {
        some: { id: courseId },
      };
    }

    const [assistant, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        select: assistantSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: assistant,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const assistant = await this.prisma.user.findUnique({
      where: { id },
      select: assistantSelect,
    });

    if (!assistant || assistant.role !== UserRole.ASSISTANT) {
      throw new NotFoundException(`Assistant not found with this id=${id}`);
    }

    return {
      success: true,
      data: assistant,
    };
  }

  async update(id: number, payload: UpdateAssistantDto, filename?: string) {
    const exist = await this.prisma.user.findUnique({ where: { id } });

    if (!exist || exist.role !== UserRole.ASSISTANT) {
      await this.files.remove("images", filename);
      throw new NotFoundException(`Assistant not found with this id=${id}`);
    }

    const orConditions: Prisma.UserWhereInput[] = [];

    if (payload.phone) {
      orConditions.push({ phone: payload.phone });
    }

    if (payload.email) {
      orConditions.push({ email: payload.email });
    }

    if (orConditions.length > 0) {
      const duplicate = await this.prisma.user.findFirst({
        where: {
          OR: orConditions,
          NOT: { id },
        },
      });

      if (duplicate) {
        await this.files.remove("images", filename);
        throw new ConflictException("Phone or email already in use");
      }
    }

    // courseId ni alohida olib, User jadvalini yangilaymiz
    const { courseId, ...userData } = payload;

    if (courseId !== undefined) {
      // courseId berilgan bo'lsa — kurs mavjudligini tekshiramiz
      if (courseId) {
        const course = await this.prisma.courses.findUnique({
          where: { id: courseId },
        });

        if (!course) {
          await this.files.remove("images", filename);
          throw new NotFoundException(
            `Course not found with this id=${courseId}`,
          );
        }

        // Eski kursdan assistantId ni olib tashlaymiz (boshqa kurs bo'lsa)
        await this.prisma.courses.updateMany({
          where: { assistantId: id, id: { not: courseId } },
          data: { assistantId: null },
        });

        // Yangi kursga assistantId o'rnatamiz
        await this.prisma.courses.update({
          where: { id: courseId },
          data: { assistantId: id },
        });
      } else {
        // courseId = 0 yoki null berilsa — barcha kurslardan olib tashlaymiz
        await this.prisma.courses.updateMany({
          where: { assistantId: id },
          data: { assistantId: null },
        });
      }
    }

    // Foydalanuvchi ma'lumotlarini yangilaymiz
    const assistant = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(filename && { file: filename }),
      },
      select: assistantSelect,
    });

    if (filename) {
      await this.files.remove("images", exist.file);
    }

    return {
      success: true,
      message: "Assistant updated successfully!",
      data: assistant,
    };
  }


  async remove(id: number) {
    const exist = await this.prisma.user.findUnique({ where: { id } });

    if (!exist || exist.role !== UserRole.ASSISTANT) {
      throw new NotFoundException(`Assistant not found with this id=${id}`);
    }

    const coursesCount = await this.prisma.courses.count({
      where: { assistantId: id },
    });

    if (coursesCount > 0) {
      throw new ConflictException(
        `This assistant is attached to ${coursesCount} course(s). Reassign them first.`,
      );
    }

    await this.prisma.user.delete({ where: { id } });
    await this.files.remove("images", exist.file);

    return {
      success: true,
      message: "Assistant deleted successfully!",
    };
  }
}
