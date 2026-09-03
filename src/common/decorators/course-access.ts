import { SetMetadata } from "@nestjs/common";

export type CourseSource =
  | "course"
  | "section"
  | "lesson"
  | "material"
  | "homework"
  | "exam";

export const COURSE_ACCESS_KEY = "course-access";

export const CourseAccess = (source: CourseSource) =>
  SetMetadata(COURSE_ACCESS_KEY, source);
