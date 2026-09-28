-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER', 'SUBSIDIARY_MANAGER', 'BU_MANAGER', 'PROJECT_MANAGER', 'DATA_CONTRIBUTOR', 'ESG_REVIEWER', 'AUDITOR', 'EXECUTIVE', 'STAKEHOLDER');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('GROUP', 'SUBSIDIARY', 'BUSINESS_UNIT', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportingBoundary" AS ENUM ('STANDALONE', 'CONSOLIDATED');

-- CreateEnum
CREATE TYPE "BRSRSectionCode" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('ESSENTIAL', 'LEADERSHIP', 'BRSR_CORE');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('DRAFT', 'ANSWERED', 'NOT_APPLICABLE', 'NOT_AVAILABLE', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('UPLOADED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BRSR_REPORT', 'ANNUAL_REPORT', 'SUSTAINABILITY_REPORT', 'POLICY', 'AUDIT_REPORT', 'PROJECT_REPORT', 'CERTIFICATE', 'INVOICE', 'UTILITY_RECORD', 'ENVIRONMENTAL_RECORD', 'SAFETY_RECORD', 'HR_RECORD', 'SUPPLIER_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'MISSING', 'INVALID', 'PENDING_REVIEW', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('ENVIRONMENT', 'SOCIAL', 'GOVERNANCE', 'ENERGY', 'WATER', 'WASTE', 'EMISSIONS', 'BIODIVERSITY', 'EMPLOYEE', 'HEALTH_SAFETY', 'COMMUNITY', 'SUPPLY_CHAIN', 'CUSTOMER', 'ETHICS');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_PROCESSED', 'EVIDENCE_CREATED', 'EVIDENCE_VERIFIED', 'EVIDENCE_REJECTED', 'BRSR_RESPONSE_CREATED', 'BRSR_RESPONSE_UPDATED', 'BRSR_RESPONSE_SUBMITTED', 'REVIEW_ACTION', 'REPORT_GENERATED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'METRIC_VALUE_ENTERED', 'ORG_CREATED', 'ORG_UPDATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "phone" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "cin" TEXT,
    "pan" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "location" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "sector" TEXT,
    "subsector" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_users" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporting_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "boundary" "ReportingBoundary" NOT NULL DEFAULT 'CONSOLIDATED',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reporting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_sections" (
    "id" TEXT NOT NULL,
    "code" "BRSRSectionCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "brsr_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_principles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT,

    CONSTRAINT "brsr_principles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_questions" (
    "id" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "indicatorType" "IndicatorType" NOT NULL,
    "responseType" TEXT NOT NULL DEFAULT 'text',
    "unit" TEXT,
    "guidance" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "principleId" TEXT,

    CONSTRAINT "brsr_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_responses" (
    "id" TEXT NOT NULL,
    "response" TEXT,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "applicability" BOOLEAN NOT NULL DEFAULT true,
    "naReason" TEXT,
    "reportingBoundary" "ReportingBoundary",
    "notes" TEXT,
    "questionId" TEXT NOT NULL,
    "reportingPeriodId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brsr_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_response_evidence" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "brsr_response_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brsr_review_history" (
    "id" TEXT NOT NULL,
    "action" "ReviewAction" NOT NULL,
    "notes" TEXT,
    "responseId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brsr_review_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_metrics" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "MetricCategory" NOT NULL,
    "unit" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'number',
    "frequency" TEXT NOT NULL DEFAULT 'annual',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sdgIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "brsr_mapping" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esg_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_metric_values" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "textValue" TEXT,
    "unit" TEXT,
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "metricId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportingPeriodId" TEXT NOT NULL,
    "evidenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esg_metric_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "reportingYear" TEXT,
    "source" TEXT,
    "pageCount" INTEGER,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'UPLOADED',
    "evidenceCode" TEXT,
    "pageReference" TEXT,
    "sectionRef" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "projectId" TEXT,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sdg_mappings" (
    "id" TEXT NOT NULL,
    "sdgNumber" INTEGER NOT NULL,
    "sdgName" TEXT NOT NULL,
    "target" TEXT,
    "indicator" TEXT,
    "activity" TEXT NOT NULL,
    "description" TEXT,
    "contribution" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sdg_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "principlesCovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "policyOwner" TEXT,
    "approvedDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_targets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" DOUBLE PRECISION,
    "unit" TEXT,
    "baseline" DOUBLE PRECISION,
    "baselineYear" TEXT,
    "targetYear" TEXT,
    "currentValue" DOUBLE PRECISION,
    "progress" DOUBLE PRECISION DEFAULT 0,
    "category" "MetricCategory",
    "principleCode" TEXT,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esg_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "project_users_projectId_userId_key" ON "project_users"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "brsr_questions_questionCode_key" ON "brsr_questions"("questionCode");

-- CreateIndex
CREATE UNIQUE INDEX "brsr_responses_questionId_reportingPeriodId_projectId_key" ON "brsr_responses"("questionId", "reportingPeriodId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "brsr_response_evidence_responseId_evidenceId_key" ON "brsr_response_evidence"("responseId", "evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "esg_metrics_code_key" ON "esg_metrics"("code");

-- CreateIndex
CREATE UNIQUE INDEX "esg_metric_values_metricId_projectId_reportingPeriodId_key" ON "esg_metric_values"("metricId", "projectId", "reportingPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_evidenceCode_key" ON "evidence"("evidenceCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_periods" ADD CONSTRAINT "reporting_periods_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_questions" ADD CONSTRAINT "brsr_questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "brsr_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_questions" ADD CONSTRAINT "brsr_questions_principleId_fkey" FOREIGN KEY ("principleId") REFERENCES "brsr_principles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_responses" ADD CONSTRAINT "brsr_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "brsr_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_responses" ADD CONSTRAINT "brsr_responses_reportingPeriodId_fkey" FOREIGN KEY ("reportingPeriodId") REFERENCES "reporting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_responses" ADD CONSTRAINT "brsr_responses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_response_evidence" ADD CONSTRAINT "brsr_response_evidence_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "brsr_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_response_evidence" ADD CONSTRAINT "brsr_response_evidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_review_history" ADD CONSTRAINT "brsr_review_history_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "brsr_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brsr_review_history" ADD CONSTRAINT "brsr_review_history_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esg_metric_values" ADD CONSTRAINT "esg_metric_values_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "esg_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esg_metric_values" ADD CONSTRAINT "esg_metric_values_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esg_metric_values" ADD CONSTRAINT "esg_metric_values_reportingPeriodId_fkey" FOREIGN KEY ("reportingPeriodId") REFERENCES "reporting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esg_metric_values" ADD CONSTRAINT "esg_metric_values_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdg_mappings" ADD CONSTRAINT "sdg_mappings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
