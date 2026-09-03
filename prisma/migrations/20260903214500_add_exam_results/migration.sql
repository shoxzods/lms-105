-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "exam_results" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'FAILED',
    "details" JSONB,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_results_userId_idx" ON "exam_results"("userId");

-- CreateIndex
CREATE INDEX "exam_results_lessonId_idx" ON "exam_results"("lessonId");

-- CreateIndex
CREATE INDEX "exam_results_create_at_idx" ON "exam_results"("create_at");

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
