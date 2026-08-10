/*
  Warnings:

  - The `status` column on the `Outreach` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Outreach" DROP COLUMN "status",
ADD COLUMN     "status" "OutreachStatus" NOT NULL DEFAULT 'NEW';
