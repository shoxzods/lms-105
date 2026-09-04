import { Module } from "@nestjs/common";
import { CourseOwner } from "src/common/services/course-owner.service";
import { QuestionController } from "./question.controller";
import { QuestionService } from "./question.service";

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, CourseOwner],
  exports: [QuestionService],
})
export class QuestionModule {}
