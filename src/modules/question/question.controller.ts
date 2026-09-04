import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { QuestionService } from "./question.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";
import { QueryQuestionDto } from "./dto/query-question.dto";

const fileUploadOptions = {
  storage: diskStorage({
    destination: "./src/uploads/files",
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: materialFileFilter,
};

@ApiTags("Questions")
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller("questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: `[${UserRole.STUDENT} | All authenticated users] Ask a question` })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", fileUploadOptions))
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateQuestionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req["user"].id;
    const item = await this.questionService.create(userId, dto, file?.filename);
    return { success: true, message: "Question submitted successfully!", data: item };
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.ASSISTANT}] Answer a question` })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", fileUploadOptions))
  @Post(":id/answer")
  async answer(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() dto: AnswerQuestionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const item = await this.questionService.answer(id, req["user"], dto, file?.filename);
    return { success: true, message: "Answer submitted successfully!", data: item };
  }

  @ApiOperation({ summary: "[All authenticated users] Get list of questions" })
  @Get()
  async findAll(@Req() req: Request, @Query() query: QueryQuestionDto) {
    const res = await this.questionService.findAll(req["user"], query);
    return { success: true, data: res.items, meta: res.meta };
  }

  @ApiOperation({ summary: "[All authenticated users] Get a single question" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const item = await this.questionService.findOne(id, req["user"]);
    return { success: true, data: item };
  }

  @ApiOperation({ summary: "[All authenticated users] Delete a question" })
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    await this.questionService.remove(id, req["user"]);
    return { success: true, message: "Question deleted successfully!" };
  }
}
