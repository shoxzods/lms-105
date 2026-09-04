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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { CoursesService } from "./courses.service";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { CreateCourseDto } from "./dto/create-course.dto";
import { QueryCourseDto } from "./dto/query-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@ApiBearerAuth()
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Create a new course`,
    description:
      "If a Teacher creates the course, mentorId is taken from the token. If an Admin creates it, mentorId comes from the request body.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "name",
        "description",
        "price",
        "level",
        "categoryId",
        "banner",
        "intro_video",
      ],
      properties: {
        name: { type: "string", example: "React asoslari" },
        description: { type: "string", example: "Reactni noldan o'rganamiz" },
        price: { type: "number", example: 1550000 },
        level: {
          type: "string",
          enum: [
            "BEGINNER",
            "ELEMENTARY",
            "PRE_INTERMEDIATE",
            "INTERMEDIATE",
            "ADVANCED",
          ],
          example: "BEGINNER",
        },
        categoryId: { type: "number", example: 1 },
        mentorId: { type: "number", example: 1 },
        assistantId: { type: "number", example: 1 },
        banner: { type: "string", format: "binary" },
        intro_video: { type: "string", format: "binary" },
      },
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "banner", maxCount: 1 },
        { name: "intro_video", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder =
              file.fieldname === "intro_video" ? "videos" : "images";
            cb(null, `./src/uploads/${folder}`);
          },
          filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
        limits: {
          fileSize: 100 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const ok =
            file.fieldname === "banner"
              ? file.mimetype.startsWith("image/")
              : file.mimetype.startsWith("video/");

          cb(null, ok);
        },
      },
    ),
  )
  create(
    @Body() payload: CreateCourseDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      intro_video?: Express.Multer.File[];
    },
    @Req() req: Request,
  ) {
    const banner = files?.banner?.[0];
    const video = files?.intro_video?.[0];

    if (!banner || !video) {
      throw new BadRequestException("banner va intro_video majburiy");
    }

    return this.coursesService.create(
      payload,
      banner.filename,
      video.filename,
      req["user"],
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get list of courses`,
    description: "Teachers only see their own courses.",
  })
  @Get()
  findAll(@Query() query: QueryCourseDto, @Req() req: Request) {
    return this.coursesService.findAll(query, req["user"]);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get a single course` })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.coursesService.findOne(id, req["user"]);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Update a course` })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        level: {
          type: "string",
          enum: [
            "BEGINNER",
            "ELEMENTARY",
            "PRE_INTERMEDIATE",
            "INTERMEDIATE",
            "ADVANCED",
          ],
        },
        categoryId: { type: "number" },
        mentorId: { type: "number" },
        assistantId: { type: "number" },
        banner: { type: "string", format: "binary" },
        intro_video: { type: "string", format: "binary" },
      },
    },
  })
  @Patch(":id")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "banner", maxCount: 1 },
        { name: "intro_video", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder =
              file.fieldname === "intro_video" ? "videos" : "images";
            cb(null, `./src/uploads/${folder}`);
          },
          filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const ok =
            file.fieldname === "banner"
              ? file.mimetype.startsWith("image/")
              : file.mimetype.startsWith("video/");

          cb(null, ok);
        },
      },
    ),
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateCourseDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      intro_video?: Express.Multer.File[];
    },
    @Req() req: Request,
  ) {
    return this.coursesService.update(
      id,
      payload,
      files?.banner?.[0]?.filename,
      files?.intro_video?.[0]?.filename,
      req["user"],
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN}] Delete a course` })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
