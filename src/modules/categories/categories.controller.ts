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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { QueryCategoryDto } from "./dto/query-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiBearerAuth()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Create a category`,
  })
  @Post()
  create(@Body() payload: CreateCategoryDto) {
    return this.categoriesService.create(payload);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get list of categories` })
  @Get()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get a single category` })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Update a category` })
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, payload);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN}] Delete a category` })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
