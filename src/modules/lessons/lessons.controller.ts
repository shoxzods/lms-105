import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { CourseAccessGuard } from "src/common/guards/course-access.guard";
import { CourseAccess } from "src/common/decorators/course-access";
import { LessonsService } from "./lessons.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { QueryLessonDto } from "./dto/query-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

const lessonUpload = FileInterceptor("file", {
  storage: diskStorage({
    destination: "./src/uploads/videos",
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("video/"));
  },
});

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, CourseAccessGuard)
@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: "Dars qo'shish",
    description: "Mentor faqat o'z kursining bo'limiga qo'sha oladi.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "description", "sectionId", "file"],
      properties: {
        name: { type: "string", example: "1-dars:HTML asoslari" },
        description: {
          type: "string",
          example: "HTML teglari bilan tanishamiz",
        },
        sectionId: { type: "number", example: 1 },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Post()
  @UseInterceptors(lessonUpload)
  create(
    @Body() payload: CreateLessonDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Dars videosi majburiy");
    }

    return this.lessonsService.create(payload, file.filename, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("section")
  @ApiOperation({ summary: "Darslar ro'yhati" })
  @Get()
  findAll(@Query() query: QueryLessonDto, @Req() req: Request) {
    return this.lessonsService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Bitta dars" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Darsni tahrirlash" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        sectionId: { type: "number" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Patch(":id")
  @UseInterceptors(lessonUpload)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateLessonDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.lessonsService.update(id, payload, req["user"], file?.filename);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Darsni o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.lessonsService.remove(id, req["user"]);
  }
}
