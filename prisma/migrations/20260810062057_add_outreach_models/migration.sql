-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('NEW', 'CONTACTED', 'OPENED', 'REPLIED', 'CONVERTED', 'UNSUBSCRIBED', 'DEAD');

-- CreateEnum
CREATE TYPE "OutreachEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutreachEmailEventType" AS ENUM ('OPEN', 'CLICK');

-- CreateTable
CREATE TABLE "Outreach" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachScheduledEmail" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "campaignId" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "OutreachEmailStatus" NOT NULL DEFAULT 'PENDING',
    "failReason" TEXT,
    "parentEmailId" TEXT,
    "trackingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachScheduledEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachEmailEvent" (
    "id" TEXT NOT NULL,
    "scheduledEmailId" TEXT NOT NULL,
    "type" "OutreachEmailEventType" NOT NULL,
    "url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachEmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outreach_email_key" ON "Outreach"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachScheduledEmail_trackingId_key" ON "OutreachScheduledEmail"("trackingId");

-- AddForeignKey
ALTER TABLE "OutreachScheduledEmail" ADD CONSTRAINT "OutreachScheduledEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Outreach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachScheduledEmail" ADD CONSTRAINT "OutreachScheduledEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachScheduledEmail" ADD CONSTRAINT "OutreachScheduledEmail_parentEmailId_fkey" FOREIGN KEY ("parentEmailId") REFERENCES "OutreachScheduledEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachEmailEvent" ADD CONSTRAINT "OutreachEmailEvent_scheduledEmailId_fkey" FOREIGN KEY ("scheduledEmailId") REFERENCES "OutreachScheduledEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
