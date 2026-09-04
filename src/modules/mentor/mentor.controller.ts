import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { MentorService } from "./mentor.service";
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
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
  CurrentUser,
  type CurrentUserPayload,
} from "src/common/decorators/current-user";
import { CreateMentorDto } from "./dto/create-mentor.dto";
import { UpdateMentorDto } from "./dto/update-mentor.dto";
import { QueryMentorDto } from "./dto/query-mentor.dto";
import { extname } from "path";

@ApiBearerAuth()
@Controller("mentor")
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Create a new mentor`,
    description: "Creates a mentor profile and user account.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
        file: { format: "binary", type: "string" },
      },
    },
  })
  @Post("create")
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
  createMentor(
    @Body() payload: CreateMentorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.mentorService.createMentor(payload, file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.TEACHER}] View own profile`,
  })
  @Get("profile")
  profile(@CurrentUser() user: CurrentUserPayload) {
    return this.mentorService.profile(user);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.TEACHER}] Get students enrolled in own courses`,
  })
  @Get("my-students")
  myStudents(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryMentorDto,
  ) {
    return this.mentorService.myStudents(user, query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.TEACHER}] Get assistants assigned to own courses`,
  })
  @Get("my-assistants")
  myAssistants(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryMentorDto,
  ) {
    return this.mentorService.myAssistants(user, query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: `[${UserRole.TEACHER}] Update own profile`,
  })
  @Patch("profile")
  updateProfile(
    @CurrentUser("id") id: number,
    @Body() payload: UpdateMentorDto,
  ) {
    return this.mentorService.updateMentor(id, payload);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Get list of mentors` })
  @Get()
  findAll(@Query() query: QueryMentorDto) {
    return this.mentorService.findAll(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Get a single mentor` })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.mentorService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `[${UserRole.SUPERADMIN} | ${UserRole.ADMIN}] Update a mentor`,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        job: { type: "string" },
        experience: { type: "number" },
        description: { type: "string" },
        telegram: { type: "string" },
        file: { format: "binary", type: "string" },
      },
    },
  })
  @Patch(":id")
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
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateMentorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.mentorService.updateMentor(id, payload, file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: `[${UserRole.SUPERADMIN}] Delete a mentor` })
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.mentorService.remove(id);
  }
}
