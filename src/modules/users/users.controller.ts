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
import { UsersService } from "./users.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer"; //buni qolda import qilish kere bomasa chiqmidi!
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { Roles } from "src/common/decorators/role";
import { UserRole } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { extname } from "path";

@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Create a new admin user`,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["full_name", "phone", "email", "password"],
      properties: {
        full_name: { type: "string", example: "Javohir Yunusov" },
        phone: { type: "string", example: "+998977771777" },
        email: { type: "string", example: "javohir@gmail.ru" },
        password: { type: "string", example: "1234567" },
        file: { format: "binary", type: "string" },
      },
    },
  })
  @Post("admin")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./src/uploads/images",
        filename: (req, file, cb) => {
          const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith("image/"));
      },
    }),
  )
  createAdmin(
    @Body() payload: CreateAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.createAdmin(payload, file?.filename);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Update a user`,
    description:
      "SUPERADMIN can update admins and students. ADMIN can only update students. Each user can edit their own profile.",
  })
  updateAdmin(
    @Body() payload: UpdateAdminDto,
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.userService.updateAdmin(payload, id, req["user"]);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get list of users`,
  })
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN} | ${UserRole.TEACHER}] Get a single user`,
  })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN}] Delete a user`,
  })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.userService.remove(id, req["user"].id);
  }
}
