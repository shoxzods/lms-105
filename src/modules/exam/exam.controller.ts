import {
  Body,
  Controller,
  Req,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  @ApiOperation({ summary: "Testlar ro'yxati" })
  @Get()
  findAll(@Query() query: QueryExamDto, @Req() req: Request) {
    return this.examService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Javoblarni tekshirish va ball olish" })
  @Post("check")
  check(@Body() payload: CheckExamDto) {
    return this.examService.check(payload);
  }

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
