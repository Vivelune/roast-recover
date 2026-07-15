-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "caseQty" INTEGER,
ADD COLUMN     "machineType" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "packageSize" TEXT,
ADD COLUMN     "shortDesc" TEXT,
ADD COLUMN     "tags" TEXT[];
