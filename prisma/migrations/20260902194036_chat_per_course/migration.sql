/*
  Warnings:

  - You are about to drop the column `studentId` on the `chat_messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_studentId_fkey";

-- DropIndex
DROP INDEX "chat_messages_courseId_studentId_create_at_idx";

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "studentId";

-- CreateIndex
CREATE INDEX "chat_messages_courseId_create_at_idx" ON "chat_messages"("courseId", "create_at");
