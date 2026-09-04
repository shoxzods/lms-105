import { CurrentUserPayload } from "./../../common/decorators/current-user";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMentorDto } from "./dto/create-mentor.dto";
import hashPassword from "src/common/config/hash";
import { Prisma, UserRole } from "@prisma/client";
import { UpdateMentorDto } from "./dto/update-mentor.dto";
import { QueryMentorDto } from "./dto/query-mentor.dto";
import { FileCleanup } from "src/common/services/file-cleanup.service";

@Injectable()
export class MentorService {
  constructor(
    private prisma: PrismaService,
    private files: FileCleanup,
  ) {}

  async createMentor(payload: CreateMentorDto, filename?: string) {
    const exist = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: payload.phone }, { email: payload.email }],
      },
    });

    if (exist) {
      await this.files.remove("images", filename);

      throw new ConflictException(
        "User already exists with this phone or email",
      );
    }

    const { full_name, phone, email, password, ...profile } = payload;

    const mentor = await this.prisma.user.create({
      data: {
        full_name,
        phone,
        email,
        password: await hashPassword(password),
        file: filename || null,
        role: UserRole.TEACHER,
        mentorProfile: {
          create: profile,
        },
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        file: true,
        create_at: true,
        mentorProfile: true,
      },
    });

    return {
      success: true,
      message: "Mentor created successfully!",
      data: mentor,
    };
  }

  async profile(currentUser: CurrentUserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        file: true,
        role: true,
        create_at: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      success: true,
      data: user,
    };
  }

  async updateMentor(
    id: number,
    payload: UpdateMentorDto,
    filename?: string,
  ) {
    const exist = await this.prisma.user.findUnique({ where: { id } });

    if (!exist) {
      await this.files.remove("images", filename);

      throw new NotFoundException(`Mentor not found with this id=${id}`);
    }

    if (exist.role !== UserRole.TEACHER) {
      await this.files.remove("images", filename);

      throw new ForbiddenException("This user is not a mentor");
    }

    const { full_name, phone, email, ...profile } = payload;

    const orConditions: Prisma.UserWhereInput[] = [];

    if (phone) {
      orConditions.push({ phone });
    }

    if (email) {
      orConditions.push({ email });
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

    const data: Prisma.UserUpdateInput = { full_name, phone, email };

    if (filename) {
      data.file = filename;
    }

    if (Object.keys(profile).length > 0) {
      data.mentorProfile = {
        updateMany: {
          where: { userId: id },
          data: profile,
        },
      };
    }

    const mentor = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        file: true,
        create_at: true,
        mentorProfile: true,
      },
    });

    if (filename) {
      await this.files.remove("images", exist.file);
    }

    return {
      success: true,
      message: "Mentor updated successfully!",
      data: mentor,
    };
  }

  async findOne(id: number) {
    const mentor = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        file: true,
        create_at: true,
        mentorProfile: true,
      },
    });

    if (!mentor || mentor.role !== UserRole.TEACHER) {
      throw new NotFoundException(`Mentor not found with this id=${id}`);
    }

    return {
      success: true,
      data: mentor,
    };
  }

  async findAll(query: QueryMentorDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { role: UserRole.TEACHER };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [mentors, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          role: true,
          file: true,
          create_at: true,
          mentorProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: mentors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async myStudents(
    currentUser: CurrentUserPayload,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const search = query.search;
    const skip = (page - 1) * limit;

    // Mentorning MentorProfile.id sini topamiz
    const profile = await this.prisma.mentorProfile.findFirst({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    if (!profile) {
      return {
        success: true,
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    // Mentorning kurslarini topamiz
    const courses = await this.prisma.courses.findMany({
      where: { mentorId: profile.id },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        success: true,
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const where: Prisma.UserWhereInput = {
      role: UserRole.STUDENT,
      purchasedCourses: { some: { courseId: { in: courseIds } } },
    };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [students, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          role: true,
          file: true,
          status: true,
          create_at: true,
          _count: { select: { purchasedCourses: true } },
          purchasedCourses: { select: { status: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: students,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async myAssistants(
    currentUser: CurrentUserPayload,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const search = query.search;
    const skip = (page - 1) * limit;

    // Mentorning kurslarini topamiz
    const profile = await this.prisma.mentorProfile.findFirst({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    if (!profile) {
      return {
        success: true,
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const courses = await this.prisma.courses.findMany({
      where: { mentorId: profile.id },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        success: true,
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const where: Prisma.UserWhereInput = {
      role: UserRole.ASSISTANT,
      courses: { some: { id: { in: courseIds } } },
    };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [assistants, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          role: true,
          file: true,
          status: true,
          create_at: true,
          courses: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: assistants,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async remove(id: number) {
    const mentor = await this.prisma.user.findUnique({
      where: { id },
      include: { mentorProfile: true },
    });

    if (!mentor || mentor.role !== UserRole.TEACHER) {
      throw new NotFoundException(`Mentor not found with this id=${id}`);
    }

    const profileIds = mentor.mentorProfile.map((p) => p.id);

    const coursesCount = await this.prisma.courses.count({
      where: { mentorId: { in: profileIds } },
    });

    if (coursesCount > 0) {
      throw new BadRequestException(
        `This mentor has ${coursesCount} course(s). Delete or reassign them first.`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.mentorProfile.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    await this.files.remove('images', mentor.file);

    return {
      success: true,
      message: 'Mentor deleted successfully!',
    };
  }
}
