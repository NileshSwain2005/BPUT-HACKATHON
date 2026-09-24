const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PRAVAAH database...');

  // ── Organization Hierarchy ──────────────────────────────────────────
  const groupOrg = await prisma.organization.upsert({
    where: { id: 'org-group-001' },
    update: {},
    create: {
      id: 'org-group-001',
      name: 'MEIL Group',
      type: 'GROUP',
      cin: 'U40109TG2000PLC034518',
      website: 'https://www.meil.in',
      address: '6-3-1090, TSR Towers, Raj Bhavan Road',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      email: 'esg@meil.in',
      description: 'Megha Engineering and Infrastructures Ltd - Group Level',
    },
  });

  const subsidiary1 = await prisma.organization.upsert({
    where: { id: 'org-sub-001' },
    update: {},
    create: {
      id: 'org-sub-001',
      name: 'MEIL Infrastructure Ltd',
      type: 'SUBSIDIARY',
      parentId: groupOrg.id,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const subsidiary2 = await prisma.organization.upsert({
    where: { id: 'org-sub-002' },
    update: {},
    create: {
      id: 'org-sub-002',
      name: 'MEIL Power Projects Ltd',
      type: 'SUBSIDIARY',
      parentId: groupOrg.id,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const buOdisha = await prisma.organization.upsert({
    where: { id: 'org-bu-001' },
    update: {},
    create: {
      id: 'org-bu-001',
      name: 'Odisha Business Unit',
      type: 'BUSINESS_UNIT',
      parentId: subsidiary1.id,
      city: 'Bhubaneswar',
      state: 'Odisha',
      country: 'India',
    },
  });

  // ── Demo Users (all 11 roles) ───────────────────────────────────────
  const password = await bcrypt.hash('Pravaah@123', 10);

  const users = [
    {
      id: 'user-001',
      email: 'superadmin@pravaah.in',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      designation: 'System Administrator',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-002',
      email: 'esgadmin@pravaah.in',
      name: 'ESG Admin',
      role: 'ESG_ADMIN',
      designation: 'ESG System Administrator',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-003',
      email: 'groupesg@pravaah.in',
      name: 'Rahul Sharma',
      role: 'GROUP_ESG_MANAGER',
      designation: 'Group ESG Manager',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-004',
      email: 'subsidiary@pravaah.in',
      name: 'Priya Nair',
      role: 'SUBSIDIARY_MANAGER',
      designation: 'Subsidiary ESG Manager',
      organizationId: subsidiary1.id,
    },
    {
      id: 'user-005',
      email: 'bumanager@pravaah.in',
      name: 'Arun Kumar',
      role: 'BU_MANAGER',
      designation: 'Business Unit Manager',
      organizationId: buOdisha.id,
    },
    {
      id: 'user-006',
      email: 'projectmgr@pravaah.in',
      name: 'Suman Patel',
      role: 'PROJECT_MANAGER',
      designation: 'Project Manager',
      organizationId: buOdisha.id,
    },
    {
      id: 'user-007',
      email: 'contributor@pravaah.in',
      name: 'Anita Das',
      role: 'DATA_CONTRIBUTOR',
      designation: 'ESG Data Analyst',
      organizationId: buOdisha.id,
    },
    {
      id: 'user-008',
      email: 'reviewer@pravaah.in',
      name: 'Vikram Singh',
      role: 'ESG_REVIEWER',
      designation: 'ESG Reviewer',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-009',
      email: 'auditor@pravaah.in',
      name: 'Meera Joshi',
      role: 'AUDITOR',
      designation: 'ESG Auditor',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-010',
      email: 'executive@pravaah.in',
      name: 'Rajesh Gupta',
      role: 'EXECUTIVE',
      designation: 'Chief Sustainability Officer',
      organizationId: groupOrg.id,
    },
    {
      id: 'user-011',
      email: 'stakeholder@pravaah.in',
      name: 'External Stakeholder',
      role: 'STAKEHOLDER',
      designation: 'External ESG Analyst',
      organizationId: null,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, passwordHash: password },
    });
  }

  // ── Reporting Period ────────────────────────────────────────────────
  const period = await prisma.reportingPeriod.upsert({
    where: { id: 'rp-2025-26' },
    update: {},
    create: {
      id: 'rp-2025-26',
      name: 'FY 2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      boundary: 'CONSOLIDATED',
      isActive: true,
      isCurrent: true,
      organizationId: groupOrg.id,
    },
  });

  const period2 = await prisma.reportingPeriod.upsert({
    where: { id: 'rp-2024-25' },
    update: {},
    create: {
      id: 'rp-2024-25',
      name: 'FY 2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      boundary: 'CONSOLIDATED',
      isActive: false,
      isCurrent: false,
      organizationId: groupOrg.id,
    },
  });

  // ── Projects ────────────────────────────────────────────────────────
  const proj1 = await prisma.project.upsert({
    where: { code: 'MEIL-OD-001' },
    update: {},
    create: {
      id: 'proj-001',
      name: 'Odisha Water Supply Pipeline Project',
      code: 'MEIL-OD-001',
      description: 'Rural water supply infrastructure project covering 12 districts in Odisha',
      location: 'Bhubaneswar, Odisha',
      state: 'Odisha',
      sector: 'Water & Sanitation',
      subsector: 'Rural Water Supply',
      startDate: new Date('2023-06-01'),
      status: 'ACTIVE',
      budget: 2500000000,
      organizationId: buOdisha.id,
    },
  });

  const proj2 = await prisma.project.upsert({
    where: { code: 'MEIL-TS-002' },
    update: {},
    create: {
      id: 'proj-002',
      name: 'Telangana Solar Power Plant',
      code: 'MEIL-TS-002',
      description: '100 MW solar power plant in Nalgonda district',
      location: 'Nalgonda, Telangana',
      state: 'Telangana',
      sector: 'Renewable Energy',
      subsector: 'Solar',
      startDate: new Date('2024-01-15'),
      status: 'ACTIVE',
      budget: 5800000000,
      organizationId: subsidiary2.id,
    },
  });

  const proj3 = await prisma.project.upsert({
    where: { code: 'MEIL-AP-003' },
    update: {},
    create: {
      id: 'proj-003',
      name: 'Andhra Pradesh Road Development',
      code: 'MEIL-AP-003',
      description: '4-lane highway construction across 3 districts',
      location: 'Vijayawada, Andhra Pradesh',
      state: 'Andhra Pradesh',
      sector: 'Infrastructure',
      subsector: 'Roads & Highways',
      startDate: new Date('2022-09-01'),
      endDate: new Date('2025-08-31'),
      status: 'ACTIVE',
      budget: 12000000000,
      organizationId: subsidiary1.id,
    },
  });

  // Assign project manager to projects
  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: proj1.id, userId: 'user-006' } },
    update: {},
    create: { projectId: proj1.id, userId: 'user-006' },
  });
  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: proj1.id, userId: 'user-007' } },
    update: {},
    create: { projectId: proj1.id, userId: 'user-007' },
  });

  // ── BRSR Sections ───────────────────────────────────────────────────
  const sectionA = await prisma.bRSRSection.upsert({
    where: { id: 'sec-A' },
    update: {},
    create: {
      id: 'sec-A',
      code: 'A',
      name: 'Section A — General Disclosures',
      description: 'General information about the listed entity',
      orderIndex: 1,
    },
  });

  const sectionB = await prisma.bRSRSection.upsert({
    where: { id: 'sec-B' },
    update: {},
    create: {
      id: 'sec-B',
      code: 'B',
      name: 'Section B — Management & Process Disclosures',
      description: 'Policies, governance, targets, and stakeholder engagement',
      orderIndex: 2,
    },
  });

  const sectionC = await prisma.bRSRSection.upsert({
    where: { id: 'sec-C' },
    update: {},
    create: {
      id: 'sec-C',
      code: 'C',
      name: 'Section C — Principle-wise Performance Disclosure',
      description: 'Performance disclosures for all 9 NGRBC principles',
      orderIndex: 3,
    },
  });

  // ── BRSR Principles ─────────────────────────────────────────────────
  const principles = [
    { id: 'p1', code: 'P1', number: 1, name: 'Ethics, Transparency & Accountability', theme: 'Governance' },
    { id: 'p2', code: 'P2', number: 2, name: 'Safe & Sustainable Products/Services', theme: 'Products' },
    { id: 'p3', code: 'P3', number: 3, name: 'Employee Well-being', theme: 'Social' },
    { id: 'p4', code: 'P4', number: 4, name: 'Stakeholder Engagement', theme: 'Stakeholders' },
    { id: 'p5', code: 'P5', number: 5, name: 'Human Rights', theme: 'Social' },
    { id: 'p6', code: 'P6', number: 6, name: 'Environment', theme: 'Environment' },
    { id: 'p7', code: 'P7', number: 7, name: 'Responsible Policy Engagement', theme: 'Governance' },
    { id: 'p8', code: 'P8', number: 8, name: 'Inclusive Growth & Equitable Development', theme: 'Social' },
    { id: 'p9', code: 'P9', number: 9, name: 'Responsible Consumer Practices', theme: 'Customers' },
  ];
  for (const p of principles) {
    await prisma.bRSRPrinciple.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // ── BRSR Questions (sample set) ─────────────────────────────────────
  const questions = [
    // Section A
    { id: 'q-A-001', questionCode: 'A-001', text: 'Name of the Listed Entity', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 1, responseType: 'text' },
    { id: 'q-A-002', questionCode: 'A-002', text: 'Corporate Identity Number (CIN)', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 2, responseType: 'text' },
    { id: 'q-A-003', questionCode: 'A-003', text: 'Reporting year (for which this report is being made)', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 3, responseType: 'text' },
    { id: 'q-A-004', questionCode: 'A-004', text: 'Registered office address', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 4, responseType: 'text' },
    { id: 'q-A-005', questionCode: 'A-005', text: 'Corporate office address', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 5, responseType: 'text' },
    { id: 'q-A-006', questionCode: 'A-006', text: 'E-mail address of the listed entity', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 6, responseType: 'text' },
    { id: 'q-A-007', questionCode: 'A-007', text: 'Telephone number with STD code', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 7, responseType: 'text' },
    { id: 'q-A-008', questionCode: 'A-008', text: 'Website', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 8, responseType: 'text' },
    { id: 'q-A-009', questionCode: 'A-009', text: 'Financial year for which reporting is being done', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 9, responseType: 'text' },
    { id: 'q-A-010', questionCode: 'A-010', text: 'Name of the Stock Exchange(s) where shares are listed', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 10, responseType: 'text' },
    { id: 'q-A-011', questionCode: 'A-011', text: 'Paid-up Capital (in INR)', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 11, responseType: 'number', unit: 'INR' },
    { id: 'q-A-012', questionCode: 'A-012', text: 'Name and contact details of person responsible for this report', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 12, responseType: 'text' },
    { id: 'q-A-013', questionCode: 'A-013', text: 'Reporting Boundary', sectionId: 'sec-A', indicatorType: 'ESSENTIAL', orderIndex: 13, responseType: 'text' },
    // Section B
    { id: 'q-B-001', questionCode: 'B-001', text: 'Does the entity have a policy/policies to address each principle of the NGRBCs?', sectionId: 'sec-B', indicatorType: 'ESSENTIAL', orderIndex: 1, responseType: 'table' },
    { id: 'q-B-002', questionCode: 'B-002', text: 'Has the entity carried out independent assessment/evaluation of working of its policies?', sectionId: 'sec-B', indicatorType: 'ESSENTIAL', orderIndex: 2, responseType: 'table' },
    { id: 'q-B-003', questionCode: 'B-003', text: 'Describe the processes for identifying key stakeholder groups', sectionId: 'sec-B', indicatorType: 'ESSENTIAL', orderIndex: 3, responseType: 'text' },
    { id: 'q-B-004', questionCode: 'B-004', text: 'Describe the mechanisms for receiving and responding to stakeholder concerns', sectionId: 'sec-B', indicatorType: 'ESSENTIAL', orderIndex: 4, responseType: 'text' },
    // Section C - P6 (Environment) - Essential
    { id: 'q-C-P6-E-01', questionCode: 'C-P6-E-01', text: 'Details of total energy consumption (in Joules or multiples) and energy intensity', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 1, responseType: 'table', unit: 'GJ', guidance: 'Include electricity, fuel, and other energy consumed' },
    { id: 'q-C-P6-E-02', questionCode: 'C-P6-E-02', text: 'Does the entity have any sites/facilities identified as designated consumers (DCs) under the Performance, Achieve and Trade (PAT) Scheme?', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 2, responseType: 'boolean' },
    { id: 'q-C-P6-E-03', questionCode: 'C-P6-E-03', text: 'Details of total water withdrawal by source (in kilolitres)', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 3, responseType: 'table', unit: 'KL' },
    { id: 'q-C-P6-E-04', questionCode: 'C-P6-E-04', text: 'Has the entity implemented a mechanism for Zero Liquid Discharge?', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 4, responseType: 'boolean' },
    { id: 'q-C-P6-E-05', questionCode: 'C-P6-E-05', text: 'Details of greenhouse gas emissions and Scope 1 and 2 (in metric tonnes of CO2 equivalent)', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 5, responseType: 'table', unit: 'tCO2e', guidance: 'Report Scope 1 and Scope 2 emissions separately' },
    { id: 'q-C-P6-E-06', questionCode: 'C-P6-E-06', text: 'Details of total Scope 3 emissions in metric tonnes of CO2 equivalent', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'LEADERSHIP', orderIndex: 6, responseType: 'table', unit: 'tCO2e' },
    { id: 'q-C-P6-E-07', questionCode: 'C-P6-E-07', text: 'Does the entity have a business continuity and disaster management plan?', sectionId: 'sec-C', principleId: 'p6', indicatorType: 'ESSENTIAL', orderIndex: 7, responseType: 'boolean' },
    // P3 - Employee Well-being
    { id: 'q-C-P3-E-01', questionCode: 'C-P3-E-01', text: 'Number of employees and workers (permanent and other than permanent)', sectionId: 'sec-C', principleId: 'p3', indicatorType: 'ESSENTIAL', orderIndex: 1, responseType: 'table' },
    { id: 'q-C-P3-E-02', questionCode: 'C-P3-E-02', text: 'Details of benefits provided to employees and workers', sectionId: 'sec-C', principleId: 'p3', indicatorType: 'ESSENTIAL', orderIndex: 2, responseType: 'table' },
    { id: 'q-C-P3-E-03', questionCode: 'C-P3-E-03', text: 'Number of complaints and grievances on any of the workplace principles (Health & Safety, etc.)', sectionId: 'sec-C', principleId: 'p3', indicatorType: 'ESSENTIAL', orderIndex: 3, responseType: 'table' },
    // P1 - Ethics
    { id: 'q-C-P1-E-01', questionCode: 'C-P1-E-01', text: 'Number of complaints relating to conflicts of interest', sectionId: 'sec-C', principleId: 'p1', indicatorType: 'ESSENTIAL', orderIndex: 1, responseType: 'table' },
    { id: 'q-C-P1-E-02', questionCode: 'C-P1-E-02', text: 'Does the entity have processes for whistle-blower complaints received/resolved?', sectionId: 'sec-C', principleId: 'p1', indicatorType: 'ESSENTIAL', orderIndex: 2, responseType: 'boolean' },
  ];

  for (const q of questions) {
    await prisma.bRSRQuestion.upsert({
      where: { questionCode: q.questionCode },
      update: {},
      create: q,
    });
  }

  // ── ESG Metrics ─────────────────────────────────────────────────────
  const metrics = [
    { id: 'm-001', code: 'ENV-SCOPE1', name: 'Scope 1 GHG Emissions', category: 'EMISSIONS', unit: 'tCO2e', dataType: 'number', sdgIds: [13], brsr_mapping: 'C-P6-E-05' },
    { id: 'm-002', code: 'ENV-SCOPE2', name: 'Scope 2 GHG Emissions', category: 'EMISSIONS', unit: 'tCO2e', dataType: 'number', sdgIds: [13], brsr_mapping: 'C-P6-E-05' },
    { id: 'm-003', code: 'ENV-ENERGY-TOTAL', name: 'Total Energy Consumption', category: 'ENERGY', unit: 'GJ', dataType: 'number', sdgIds: [7, 13], brsr_mapping: 'C-P6-E-01' },
    { id: 'm-004', code: 'ENV-ENERGY-RENEW', name: 'Renewable Energy Consumption', category: 'ENERGY', unit: 'GJ', dataType: 'number', sdgIds: [7], brsr_mapping: 'C-P6-E-01' },
    { id: 'm-005', code: 'ENV-WATER-TOTAL', name: 'Total Water Withdrawal', category: 'WATER', unit: 'KL', dataType: 'number', sdgIds: [6], brsr_mapping: 'C-P6-E-03' },
    { id: 'm-006', code: 'ENV-WATER-RECYCLED', name: 'Water Recycled/Reused', category: 'WATER', unit: 'KL', dataType: 'number', sdgIds: [6] },
    { id: 'm-007', code: 'ENV-WASTE-TOTAL', name: 'Total Waste Generated', category: 'WASTE', unit: 'MT', dataType: 'number', sdgIds: [12] },
    { id: 'm-008', code: 'SOC-EMP-TOTAL', name: 'Total Employees', category: 'EMPLOYEE', unit: 'Count', dataType: 'number', sdgIds: [8], brsr_mapping: 'C-P3-E-01' },
    { id: 'm-009', code: 'SOC-EMP-FEMALE', name: 'Female Employees', category: 'EMPLOYEE', unit: 'Count', dataType: 'number', sdgIds: [5, 8], brsr_mapping: 'C-P3-E-01' },
    { id: 'm-010', code: 'SOC-SAFETY-LTI', name: 'Lost Time Injury Frequency Rate', category: 'HEALTH_SAFETY', unit: 'per million hours', dataType: 'number', sdgIds: [8], brsr_mapping: 'C-P3-E-03' },
    { id: 'm-011', code: 'SOC-TRAINING-HRS', name: 'Average Training Hours per Employee', category: 'EMPLOYEE', unit: 'Hours/Employee', dataType: 'number', sdgIds: [4, 8] },
    { id: 'm-012', code: 'GOV-BOARD-INDEP', name: 'Independent Directors on Board (%)', category: 'GOVERNANCE', unit: '%', dataType: 'percentage', sdgIds: [16] },
    { id: 'm-013', code: 'GOV-BOARD-FEMALE', name: 'Female Directors on Board (%)', category: 'GOVERNANCE', unit: '%', dataType: 'percentage', sdgIds: [5, 16] },
    { id: 'm-014', code: 'SOC-CSR-SPEND', name: 'CSR Expenditure', category: 'COMMUNITY', unit: 'INR Cr', dataType: 'number', sdgIds: [1, 4, 8] },
    { id: 'm-015', code: 'ENV-INTENSITY-REV', name: 'GHG Intensity per Revenue', category: 'EMISSIONS', unit: 'tCO2e / INR Cr', dataType: 'number', sdgIds: [13] },
  ];

  for (const m of metrics) {
    await prisma.eSGMetric.upsert({ where: { code: m.code }, update: {}, create: m });
  }

  // ── Demo ESG Metric Values ───────────────────────────────────────────
  const metricValues = [
    { metricId: 'm-001', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 1245.6, isVerified: true },
    { metricId: 'm-002', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 3421.0, isVerified: true },
    { metricId: 'm-003', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 18540.0, isVerified: false },
    { metricId: 'm-004', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 4200.0, isVerified: false },
    { metricId: 'm-005', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 95600.0, isVerified: true },
    { metricId: 'm-008', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 342, isVerified: true },
    { metricId: 'm-009', projectId: 'proj-001', reportingPeriodId: 'rp-2025-26', value: 28, isVerified: true },
    { metricId: 'm-001', projectId: 'proj-002', reportingPeriodId: 'rp-2025-26', value: 245.2, isVerified: true },
    { metricId: 'm-003', projectId: 'proj-002', reportingPeriodId: 'rp-2025-26', value: 42300.0, isVerified: true },
    { metricId: 'm-004', projectId: 'proj-002', reportingPeriodId: 'rp-2025-26', value: 38500.0, isVerified: true },
    { metricId: 'm-008', projectId: 'proj-002', reportingPeriodId: 'rp-2025-26', value: 186, isVerified: false },
  ];

  for (const mv of metricValues) {
    await prisma.eSGMetricValue.upsert({
      where: { metricId_projectId_reportingPeriodId: { metricId: mv.metricId, projectId: mv.projectId, reportingPeriodId: mv.reportingPeriodId } },
      update: {},
      create: mv,
    });
  }

  // ── Policies ─────────────────────────────────────────────────────────
  const policies = [
    { id: 'pol-001', name: 'Environmental Management Policy', principlesCovered: ['P6'], policyOwner: 'Chief Sustainability Officer', isActive: true },
    { id: 'pol-002', name: 'Health, Safety & Well-being Policy', principlesCovered: ['P3'], policyOwner: 'CHRO', isActive: true },
    { id: 'pol-003', name: 'Code of Conduct & Ethics Policy', principlesCovered: ['P1', 'P7'], policyOwner: 'Chief Compliance Officer', isActive: true },
    { id: 'pol-004', name: 'Human Rights Policy', principlesCovered: ['P5'], policyOwner: 'CHRO', isActive: true },
    { id: 'pol-005', name: 'Stakeholder Engagement Policy', principlesCovered: ['P4'], policyOwner: 'Chief Sustainability Officer', isActive: true },
    { id: 'pol-006', name: 'Sustainable Procurement Policy', principlesCovered: ['P2', 'P8'], policyOwner: 'Chief Procurement Officer', isActive: true },
  ];
  for (const p of policies) {
    await prisma.policy.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // ── ESG Targets ──────────────────────────────────────────────────────
  const targets = [
    { id: 'tgt-001', title: 'Net Zero Emissions by 2050', category: 'EMISSIONS', principleCode: 'P6', targetValue: 0, unit: 'tCO2e', baselineYear: '2022-23', targetYear: '2050', currentValue: 4666.6, progress: 5 },
    { id: 'tgt-002', title: '50% Renewable Energy by 2030', category: 'ENERGY', principleCode: 'P6', targetValue: 50, unit: '%', baselineYear: '2022-23', targetYear: '2030', currentValue: 22.6, progress: 45 },
    { id: 'tgt-003', title: '30% Water Intensity Reduction by 2030', category: 'WATER', principleCode: 'P6', targetValue: 30, unit: '%', baselineYear: '2022-23', targetYear: '2030', currentValue: 12.4, progress: 41 },
    { id: 'tgt-004', title: '30% Women in Workforce by 2028', category: 'EMPLOYEE', principleCode: 'P3', targetValue: 30, unit: '%', baselineYear: '2022-23', targetYear: '2028', currentValue: 8.2, progress: 27 },
    { id: 'tgt-005', title: 'Zero Fatalities', category: 'HEALTH_SAFETY', principleCode: 'P3', targetValue: 0, unit: 'count', baselineYear: '2022-23', targetYear: '2026', currentValue: 0, progress: 100, isAchieved: true },
  ];
  for (const t of targets) {
    await prisma.eSGTarget.upsert({ where: { id: t.id }, update: {}, create: t });
  }

  // ── SDG Mappings ─────────────────────────────────────────────────────
  const sdgs = [
    { id: 'sdg-001', sdgNumber: 6, sdgName: 'Clean Water and Sanitation', activity: 'Rural Water Supply', description: 'Providing clean drinking water to 12 districts', contribution: 'High', projectId: 'proj-001' },
    { id: 'sdg-002', sdgNumber: 7, sdgName: 'Affordable and Clean Energy', activity: 'Solar Power Generation', description: '100 MW clean energy capacity addition', contribution: 'High', projectId: 'proj-002' },
    { id: 'sdg-003', sdgNumber: 13, sdgName: 'Climate Action', activity: 'GHG Emission Reduction', description: 'Net zero roadmap and renewable energy deployment', contribution: 'Medium', projectId: 'proj-002' },
    { id: 'sdg-004', sdgNumber: 8, sdgName: 'Decent Work & Economic Growth', activity: 'Local Employment', description: 'Creating 5000+ local jobs across projects', contribution: 'High', projectId: 'proj-001' },
    { id: 'sdg-005', sdgNumber: 9, sdgName: 'Industry, Innovation & Infrastructure', activity: 'Infrastructure Development', description: 'Building critical infrastructure for economic development', contribution: 'High', projectId: 'proj-003' },
  ];
  for (const s of sdgs) {
    await prisma.sDGMapping.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  console.log('✅ Seeding complete!');
  console.log('\n📋 Demo Login Credentials (password: Pravaah@123):');
  console.log('  SUPER_ADMIN      → superadmin@pravaah.in');
  console.log('  ESG_ADMIN        → esgadmin@pravaah.in');
  console.log('  GROUP_ESG_MANAGER→ groupesg@pravaah.in');
  console.log('  SUBSIDIARY_MGR   → subsidiary@pravaah.in');
  console.log('  BU_MANAGER       → bumanager@pravaah.in');
  console.log('  PROJECT_MANAGER  → projectmgr@pravaah.in');
  console.log('  DATA_CONTRIBUTOR → contributor@pravaah.in');
  console.log('  ESG_REVIEWER     → reviewer@pravaah.in');
  console.log('  AUDITOR          → auditor@pravaah.in');
  console.log('  EXECUTIVE        → executive@pravaah.in');
  console.log('  STAKEHOLDER      → stakeholder@pravaah.in');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
