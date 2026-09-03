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
import { FilesInterceptor } from "@nestjs/platform-express";
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
import { MaterialsService } from "./materials.service";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { QueryMaterialDto } from "./dto/query-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";

const materialUpload = FilesInterceptor("files", 10, {
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
@Controller("materials")
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Material qo'shish(10 tagacha fayl)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["description", "lessonId", "files"],
      properties: {
        description: { type: "string", example: "Darsda ishlatilgan kod" },
        lessonId: { type: "number", example: 1 },
        files: { type: "array", items: { type: "string", format: "binary" } },
      },
    },
  })
  @Post()
  @UseInterceptors(materialUpload)
  create(
    @Body() payload: CreateMaterialDto,
    @Req() req: Request,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Kamida bitta fayl yuborilishi kerak");
    }

    return this.materialsService.create(
      payload,
      files.map((f) => f.filename),
      req["user"],
    );
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("lesson")
  @ApiOperation({ summary: "Materiallar ro'yhati" })
  @Get()
  findAll(@Query() query: QueryMaterialDto, @Req() req: Request) {
    return this.materialsService.findAll(query, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @CourseAccess("material")
  @ApiOperation({ summary: "Bitta material" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Materialni tahrirlash (fayl qo'shiladi)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        description: { type: "string" },
        lessonId: { type: "number" },
        files: { type: "array", items: { type: "string", format: "binary" } },
      },
    },
  })
  @Patch(":id")
  @UseInterceptors(materialUpload)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateMaterialDto,
    @Req() req: Request,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.materialsService.update(
      id,
      payload,
      (files ?? []).map((f) => f.filename),
      req["user"],
    );
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Materialdan bitta faylni o'chirish" })
  @Delete("file/:fileId")
  removeFile(
    @Param("fileId", ParseIntPipe) fileId: number,
    @Req() req: Request,
  ) {
    return this.materialsService.removeFile(fileId, req["user"]);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Materialni o'chirish" })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.materialsService.remove(id, req["user"]);
  }
}
