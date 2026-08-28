-- CreateTable
CREATE TABLE "user_course" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "user_course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_course_studentId_courseId_key" ON "user_course"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
