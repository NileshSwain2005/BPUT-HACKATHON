-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWER_APPROVED', 'BU_APPROVED', 'SUBSIDIARY_APPROVED', 'GROUP_APPROVED', 'PUBLISHED', 'REJECTED', 'REVISION_REQUESTED');

-- AlterTable
ALTER TABLE "esg_metric_values" ADD COLUMN     "lastActionAt" TIMESTAMP(3),
ADD COLUMN     "lastActionBy" TEXT,
ADD COLUMN     "reviewerComment" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedBy" TEXT,
ADD COLUMN     "workflowStatus" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT';
