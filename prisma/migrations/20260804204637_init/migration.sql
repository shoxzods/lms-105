-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_category_id_fkey";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
