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
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Create a new section`,
    description: "Teachers can only add sections to their own courses.",
  })
  @Post()
  create(@Body() payload: CreateSectionDto, @Req() req: Request) {
    return this.sectionsService.create(payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("course")
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Get list of sections` })
  @Get()
  findAll(@Query() query: QuerySectionDto, @Req() req: Request) {
    return this.sectionsService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("section")
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER} | ${UserRole.STUDENT}] Get a single section` })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.sectionsService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Update a section` })
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateSectionDto,
    @Req() req: Request,
  ) {
    return this.sectionsService.update(id, payload, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Delete a section` })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.sectionsService.remove(id, req["user"]);
  }
}
