import {
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
import { materialFileFilter } from "src/common/config/upload";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { CourseAccessGuard } from "src/common/guards/course-access.guard";
import { CourseAccess } from "src/common/decorators/course-access";
import { HomeworksService } from "./homeworks.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { QueryHomeworkDto } from "./dto/query-homework.dto";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";

const homeworkUpload = FileInterceptor("file", {
  storage: diskStorage({
    destination: "./src/uploads/files",
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: materialFileFilter,
});

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, CourseAccessGuard)
@Controller("homeworks")
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Vazifa berish" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["description", "lessonId"],
      properties: {
        description: {
          type: "string",
          example: "HTML sahifa yasang va yuklang",
        },
        lessonId: { type: "number", example: 1 },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Post()
  @UseInterceptors(homeworkUpload)
  create(
    @Body() payload: CreateHomeworkDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.homeworksService.create(payload, req["user"], file?.filename);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Vazifa ro'yhati" })
  @Get()
  findAll(@Query() query: QueryHomeworkDto, @Req() req: Request) {
    return this.homeworksService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("homework")
  @ApiOperation({ summary: "Bitta vazifa" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.homeworksService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Vazifani tahrirlash" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        description: { type: "string" },
        lessonId: { type: "number" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Patch(":id")
  @UseInterceptors(homeworkUpload)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateHomeworkDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.homeworksService.update(id, payload, req["user"], file?.filename);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Vazifani o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworksService.remove(id, req["user"]);
  }
}
