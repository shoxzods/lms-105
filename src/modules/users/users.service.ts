import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { Prisma, UserRole } from "@prisma/client";
import hashPassword from "src/common/config/hash";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { FileCleanup } from "src/common/services/file-cleanup.service";

const DELETABLE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.STUDENT];
const EDITABLE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.STUDENT];

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private files: FileCleanup,
  ) {}

  async createAdmin(payload: CreateAdminDto, filename?: string) {
    const existAdmin = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: payload.phone }, { email: payload.email }],
      },
    });

    if (existAdmin) {
      await this.files.remove("images", filename);

      throw new ConflictException(
        "Admin already exist with this email or phone",
      );
    }

    const admin = await this.prisma.user.create({
      data: {
        ...payload,
        role: UserRole.ADMIN,
        password: await hashPassword(payload.password),
        file: filename || null,
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        file: true,
        status: true,
        create_at: true,
      },
    });

    return {
      success: true,
      message: "Admin created successfully!",
      data: admin,
    };
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, role, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
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
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      throw new NotFoundException(`User not found with this id=${id}`);
    }

    return {
      success: true,
      data: user,
    };
  }

  async remove(id: number, currentUserId: number) {
    const existAdmin = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existAdmin) {
      throw new NotFoundException(`User not found with this id=${id}`);
    }

    if (!DELETABLE_ROLES.includes(existAdmin.role)) {
      throw new ForbiddenException(
        "Mentor va assistent o'z bo'limidan o'chiriladi",
      );
    }

    if (id === currentUserId) {
      throw new ForbiddenException("You cannot delete yourself");
    }

    await this.prisma.user.delete({ where: { id } });
    await this.files.remove("images", existAdmin.file);

    return {
      success: true,
      message: "Admin deleted successfully!",
    };
  }

  async updateAdmin(
    payload: UpdateAdminDto,
    id: number,
    actor: { id: number; role: UserRole },
  ) {
    const existUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existUser) {
      throw new NotFoundException(`User not found with this id=${id}`);
    }

    /* Har kim o'z profilini tahrirlay oladi — rolidan qat'i nazar */
    const isSelf = actor.id === id;

    if (!isSelf) {
      if (!EDITABLE_ROLES.includes(existUser.role)) {
        throw new ForbiddenException(
          existUser.role === UserRole.SUPERADMIN
            ? "Superadminni tahrirlab bo'lmaydi"
            : "Mentor va assistent o'z bo'limidan tahrirlanadi",
        );
      }

      if (
        existUser.role === UserRole.ADMIN &&
        actor.role !== UserRole.SUPERADMIN
      ) {
        throw new ForbiddenException("Adminni faqat superadmin tahrirlaydi");
      }
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
        throw new ConflictException("Phone or email already in use");
      }
    }

    await this.prisma.user.update({
      where: { id: id },
      data: payload,
    });

    return {
      success: true,
      message: "Update admin successfully!",
    };
  }
}
