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
  ApiTags,
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
import { SubmitHomeworkDto } from "./dto/submit-homework.dto";
import { GradeSubmissionDto } from "./dto/grade-submission.dto";
import { QuerySubmissionDto } from "./dto/query-submission.dto";

const homeworkUpload = FileInterceptor("file", {
  storage: diskStorage({
    destination: "./src/uploads/files",
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: materialFileFilter,
});

@ApiTags("Homeworks")
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller("homeworks")
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  /* ==================== Homework Management (O'qituvchi) ==================== */

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
  @ApiOperation({ summary: "Vazifa ro'yhati" })
  @Get()
  findAll(@Query() query: QueryHomeworkDto, @Req() req: Request) {
    return this.homeworksService.findAll(query, req["user"]);
  }

  /* ==================== Student Submission Endpoints ==================== */

  @ApiOperation({ summary: "Talaba vazifa topshirishi (Submit homework)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(homeworkUpload)
  @Post("submit")
  submit(
    @Req() req: Request,
    @Body() payload: SubmitHomeworkDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req["user"].id;
    return this.homeworksService.submit(userId, payload, file?.filename);
  }

  @ApiOperation({ summary: "Talabaning o'z topshirgan vazifalari" })
  @Get("my-submissions")
  findMySubmissions(
    @Req() req: Request,
    @Query("lessonId") lessonId?: number,
  ) {
    const userId = req["user"].id;
    return this.homeworksService.findMySubmissions(userId, lessonId);
  }

  /* ==================== Teacher / Admin Submissions Review & Grading ==================== */

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Topshirilgan vazifalar ro'yxati (O'qituvchi/Admin)" })
  @Get("submissions")
  findSubmissions(@Req() req: Request, @Query() query: QuerySubmissionDto) {
    return this.homeworksService.findSubmissions(req["user"], query);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT, UserRole.STUDENT)
  @ApiOperation({ summary: "Bitta topshirilgan vazifani olish" })
  @Get("submissions/:id")
  findOneSubmission(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.homeworksService.findOneSubmission(id, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Vazifani baholash (Grade submission)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(homeworkUpload)
  @Post("submissions/:id/grade")
  gradeSubmission(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() payload: GradeSubmissionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.homeworksService.gradeSubmission(
      id,
      req["user"],
      payload,
      file?.filename,
    );
  }

  @ApiOperation({ summary: "Topshirilgan vazifani o'chirish" })
  @Delete("submissions/:id")
  removeSubmission(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.homeworksService.removeSubmission(id, req["user"]);
  }

  /* ==================== Single Homework Routes ==================== */

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: "Bitta vazifa" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.homeworksService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Vazifani tahrirlash" })
  @ApiConsumes("multipart/form-data")
  @Patch(":id")
  @UseInterceptors(homeworkUpload)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateHomeworkDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.homeworksService.update(
      id,
      payload,
      req["user"],
      file?.filename,
    );
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Vazifani o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworksService.remove(id, req["user"]);
  }
}
