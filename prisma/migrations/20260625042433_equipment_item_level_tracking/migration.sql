-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING_DEPOSIT', 'AWAITING_BALANCE', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "balancePaidAt" TIMESTAMP(3),
ADD COLUMN     "depositPaidAt" TIMESTAMP(3),
ADD COLUMN     "depositPercent" INTEGER,
ADD COLUMN     "estimatedShipDate" TIMESTAMP(3),
ADD COLUMN     "itemStatus" "OrderItemStatus" NOT NULL DEFAULT 'PENDING_DEPOSIT',
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "stripeBalancePaymentIntentId" TEXT,
ADD COLUMN     "stripeDepositPaymentIntentId" TEXT;
