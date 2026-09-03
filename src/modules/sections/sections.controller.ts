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
import { SectionsService } from "./sections.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateSectionDto } from "./dto/create-section.dto";
import { QuerySectionDto } from "./dto/query-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, CourseAccessGuard)
@Controller("sections")
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: "Bo'lim qo'shish",
    description: "Mentor faqat o'z kursiga qo'sha oladi.",
  })
  @Post()
  create(@Body() payload: CreateSectionDto, @Req() req: Request) {
    return this.sectionsService.create(payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("course")
  @ApiOperation({ summary: "Bo'limlar ro'yhati" })
  @Get()
  findAll(@Query() query: QuerySectionDto, @Req() req: Request) {
    return this.sectionsService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("section")
  @ApiOperation({ summary: "Bitta bo'lim" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.sectionsService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Bo'limni tahrirlash" })
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateSectionDto,
    @Req() req: Request,
  ) {
    return this.sectionsService.update(id, payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Bo'limni o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.sectionsService.remove(id, req["user"]);
  }
}
