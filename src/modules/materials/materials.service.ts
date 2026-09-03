import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FileCleanup } from "src/common/services/file-cleanup.service";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { QueryMaterialDto } from "./dto/query-material.dto";
import { Prisma } from "@prisma/client";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { Actor, CourseOwner } from "src/common/services/course-owner.service";

@Injectable()
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private owner: CourseOwner,
    private files: FileCleanup,
  ) {}

  async create(
    payload: CreateMaterialDto,
    filenames: string[],
    actor: Actor,
  ) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id: payload.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson not found with this id=${payload.lessonId}`,
      );
    }

    await this.owner.assertOwnsLesson(actor, payload.lessonId);

    const material = await this.prisma.materials.create({
      data: {
        ...payload,
        materialFiles: {
          create: filenames.map((file) => ({ file })),
        },
      },
      include: {
        materialFiles: true,
        lessons: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      message: "Material created successfully!",
      data: material,
    };
  }

  async findAll(query: QueryMaterialDto, actor: Actor) {
    const { page = 1, limit = 10, search, lessonId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialsWhereInput = {};

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

    const [materials, total] = await this.prisma.$transaction([
      this.prisma.materials.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: {
          materialFiles: true,
          lessons: { select: { id: true, name: true } },
        },
      }),
      this.prisma.materials.count({ where }),
    ]);

    return {
      success: true,
      data: materials,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const material = await this.prisma.materials.findUnique({
      where: { id },
      include: {
        materialFiles: true,
        lessons: { select: { id: true, name: true } },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material not found with this id=${id}`);
    }

    return {
      success: true,
      data: material,
    };
  }

  async update(
    id: number,
    payload: UpdateMaterialDto,
    filenames: string[],
    actor: Actor,
  ) {
    const exist = await this.prisma.materials.findUnique({ where: { id } });

    if (!exist) {
      throw new NotFoundException(`Material not found with this id=${id}`);
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

    const material = await this.prisma.materials.update({
      where: { id },
      data: {
        ...payload,
        ...(filenames.length > 0 && {
          materialFiles: { create: filenames.map((file) => ({ file })) },
        }),
      },
      include: {
        materialFiles: true,
        lessons: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      message: "Material updated successfully!",
      data: material,
    };
  }

  async removeFile(fileId: number, actor: Actor) {
    const file = await this.prisma.materialFile.findUnique({
      where: { id: fileId },
      include: { material: { select: { lessonId: true } } },
    });

    if (!file) {
      throw new NotFoundException(`File not found with this id=${fileId}`);
    }

    await this.owner.assertOwnsLesson(actor, file.material.lessonId);

    const count = await this.prisma.materialFile.count({
      where: { materialId: file.materialId },
    });

    if (count === 1) {
      throw new BadRequestException(
        "Material must have at least one file. Delete the material instead.",
      );
    }

    await this.prisma.materialFile.delete({ where: { id: fileId } });

    await this.files.remove("files", file.file);

    return {
      success: true,
      message: "File deleted successfully!",
    };
  }

  async remove(id: number, actor: Actor) {
    const exist = await this.prisma.materials.findUnique({
      where: { id },
      include: { materialFiles: { select: { file: true } } },
    });

    if (!exist) {
      throw new NotFoundException(`Material not found with this id=${id}`);
    }

    await this.owner.assertOwnsLesson(actor, exist.lessonId);

    await this.prisma.materials.delete({ where: { id } });

    await this.files.removeMany(
      "files",
      exist.materialFiles.map((item) => item.file),
    );

    return {
      success: true,
      message: "Material deleted successfully!",
    };
  }
}
