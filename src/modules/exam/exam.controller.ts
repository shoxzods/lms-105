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
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Add an exam question` })
  @Post()
  create(@Body() payload: CreateExamDto, @Req() req: Request) {
    return this.examService.create(payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Get list of exam questions` })
  @Get()
  findAll(@Query() query: QueryExamDto, @Req() req: Request) {
    return this.examService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Submit answers and get score`,
  })
  @Post("check")
  check(@Body() payload: CheckExamDto, @Req() req: Request) {
    return this.examService.check(payload, req["user"]);
  }

  // ==================== RESULTS ENDPOINTS ====================

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get all students' exam results`,
  })
  @Get("results")
  findAllResults(@Query() query: QueryExamResultDto, @Req() req: Request) {
    return this.examService.findAllResults(query, req["user"]);
  }

  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: `[${UserRole.STUDENT}] Get my own exam results history` })
  @Get("results/my")
  findMyResults(@Query() query: QueryExamResultDto, @Req() req: Request) {
    return this.examService.findMyResults(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get exam results statistics` })
  @Get("results/stats")
  getResultStats(@Req() req: Request) {
    return this.examService.getResultStats(req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Get a single exam result with details` })
  @Get("results/:id")
  findOneResult(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.examService.findOneResult(id, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Delete an exam result` })
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
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Get a single exam question` })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.findOne(id, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @CourseAccess("exam")
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Update an exam question` })
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
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Delete an exam question` })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.remove(id, req["user"]);
  }
}

