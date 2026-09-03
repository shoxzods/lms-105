import { Global, Module } from "@nestjs/common";
import { CourseOwner } from "./services/course-owner.service";
import { FileCleanup } from "./services/file-cleanup.service";

@Global()
@Module({
  providers: [CourseOwner, FileCleanup],
  exports: [CourseOwner, FileCleanup],
})
export class CommonModule {}
