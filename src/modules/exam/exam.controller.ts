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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { CourseAccessGuard } from "src/common/guards/course-access.guard";
import { CourseAccess } from "src/common/decorators/course-access";
import { ExamService } from "./exam.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateExamDto } from "./dto/create-exam.dto";
import { QueryExamDto } from "./dto/query-exam.dto";
import { CheckExamDto } from "./dto/check-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { QueryExamResultDto } from "./dto/query-exam-result.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, CourseAccessGuard)
@Controller("exams")
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Test savoli qo'shish" })
  @Post()
  create(@Body() payload: CreateExamDto, @Req() req: Request) {
    return this.examService.create(payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Test savollari ro'yxati" })
  @Get()
  findAll(@Query() query: QueryExamDto, @Req() req: Request) {
    return this.examService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({
    summary: "Javoblarni tekshirish, ball olish va natijani saqlash",
  })
  @Post("check")
  check(@Body() payload: CheckExamDto, @Req() req: Request) {
    return this.examService.check(payload, req["user"]);
  }

  // ==================== RESULTS ENDPOINTS ====================

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: "Barcha talabalar natijalari (Admin / Superadmin / Mentor)",
  })
  @Get("results")
  findAllResults(@Query() query: QueryExamResultDto, @Req() req: Request) {
    return this.examService.findAllResults(query, req["user"]);
  }

  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "O'quvchining o'z imtihon natijalari tarixi" })
  @Get("results/my")
  findMyResults(@Query() query: QueryExamResultDto, @Req() req: Request) {
    return this.examService.findMyResults(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Imtihon natijalari statistikasi" })
  @Get("results/stats")
  getResultStats(@Req() req: Request) {
    return this.examService.getResultStats(req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: "Bitta imtihon natijasi va batafsil javoblar" })
  @Get("results/:id")
  findOneResult(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.examService.findOneResult(id, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Imtihon natijasini o'chirish" })
  @Delete("results/:id")
  removeResult(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.examService.removeResult(id, req["user"]);
  }

  // ==================== QUESTION BY ID ====================

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("exam")
  @ApiOperation({ summary: "Bitta test savoli" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.findOne(id, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @CourseAccess("exam")
  @ApiOperation({ summary: "Test savolini tahrirlash" })
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateExamDto,
    @Req() req: Request,
  ) {
    return this.examService.update(id, payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @CourseAccess("exam")
  @ApiOperation({ summary: "Test savolini o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.remove(id, req["user"]);
  }
}

