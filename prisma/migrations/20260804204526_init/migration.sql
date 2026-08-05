-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_mentor_id_fkey";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "mentor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
