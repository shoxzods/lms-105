/*
  Warnings:

  - You are about to drop the `user_course` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_course" DROP CONSTRAINT "user_course_courseId_fkey";

-- DropForeignKey
ALTER TABLE "user_course" DROP CONSTRAINT "user_course_studentId_fkey";

-- DropTable
DROP TABLE "user_course";

-- CreateTable
CREATE TABLE "students_course" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "students_course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_course_studentId_courseId_key" ON "students_course"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "students_course" ADD CONSTRAINT "students_course_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_course" ADD CONSTRAINT "students_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
