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

  @ApiOperation({ summary: "[Public] Get list of public courses (no token required)" })
  @Get("courses")
  courses(@Query() query: QueryPublicCourseDto) {
    return this.publicService.courses(query);
  }

  @ApiOperation({ summary: "[Public] Get a single course (no token required)" })
  @Get("courses/:id")
  courseById(@Param("id", ParseIntPipe) id: number) {
    return this.publicService.courseById(id);
  }

  @ApiOperation({ summary: "[Public] Get categories (no token required)" })
  @Get("categories")
  categories() {
    return this.publicService.categories();
  }

  @ApiOperation({ summary: "[Public] Get mentors (no token required)" })
  @Get("mentors")
  mentors() {
    return this.publicService.mentors();
  }
}
