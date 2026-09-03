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
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname, join } from "path";

import { AssistantService } from "./assistant.service";
import { AuthGuard } from "../../common/guards/jwt-auth.guard";
import { RoleGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/role";

import { UserRole } from "@prisma/client";

import { CreateAssistantDto } from "./dto/create-assistant.dto";
import { QueryAssistantDto } from "./dto/query-assistant.dto";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";

const avatarUpload = FileInterceptor("file", {
  storage: diskStorage({
    destination: join(process.cwd(), "src", "uploads", "images"),

    filename: (req, file, cb) => {
      const unique =
        Date.now() + "-" + Math.round(Math.random() * 1e9);

      cb(null, unique + extname(file.originalname));
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

@ApiBearerAuth()
@Controller("assistant")
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
  ) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN} - assistent qo'shish`,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "full_name",
        "phone",
        "password",
        "courseId",
      ],
      properties: {
        full_name: {
          type: "string",
          example: "Axmadjon Asistent",
        },
        phone: {
          type: "string",
          example: "+998901112233",
        },
        email: {
          type: "string",
          example: "axmadjon@gmail.com",
        },
        courseId: {
          type: "number",
          example: 1,
        },
        password: {
          type: "string",
          example: "axmadjon12345",
        },
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @Post()
  @UseInterceptors(avatarUpload)
  create(
    @Body() payload: CreateAssistantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assistantService.create(
      payload,
      file?.filename,
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
  )
  @ApiOperation({
    summary: "Assistentlar ro'yhati",
  })
  @Get()
  findAll(@Query() query: QueryAssistantDto) {
    return this.assistantService.findAll(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: "Bitta assistent",
  })
  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.assistantService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: "Assistentni tahrirlash",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        full_name: {
          type: "string",
        },
        phone: {
          type: "string",
        },
        email: {
          type: "string",
        },
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @Patch(":id")
  @UseInterceptors(avatarUpload)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateAssistantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assistantService.update(
      id,
      payload,
      file?.filename,
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: `${UserRole.SUPERADMIN} - assistentni o'chirish`,
  })
  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.assistantService.remove(id);
  }
}