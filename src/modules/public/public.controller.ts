import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { QueryPublicCourseDto } from "./dto/query-public-course.dto";
import { PublicService } from "./public.service";

@ApiTags("Public")
@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @ApiOperation({ summary: "Ochiq kurslar ro'yxati (token kerak emas)" })
  @Get("courses")
  courses(@Query() query: QueryPublicCourseDto) {
    return this.publicService.courses(query);
  }

  @ApiOperation({ summary: "Bitta kurs (token kerak emas)" })
  @Get("courses/:id")
  courseById(@Param("id", ParseIntPipe) id: number) {
    return this.publicService.courseById(id);
  }

  @ApiOperation({ summary: "Kategoriyalar (token kerak emas)" })
  @Get("categories")
  categories() {
    return this.publicService.categories();
  }

  @ApiOperation({ summary: "Mentorlar (token kerak emas)" })
  @Get("mentors")
  mentors() {
    return this.publicService.mentors();
  }
}
