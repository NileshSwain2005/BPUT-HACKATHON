<div align="center">

# 🌊 PRAVAAH

### Intelligent ESG & BRSR Management Platform

**From Project Data to Trusted ESG Disclosure.**

[![Status](https://img.shields.io/badge/Status-In%20Development-d4af37?style=for-the-badge)](#)
[![ESG](https://img.shields.io/badge/ESG-Intelligence-1f4d3f?style=for-the-badge)](#)
[![AI](https://img.shields.io/badge/AI-Enabled-0f766e?style=for-the-badge)](#)
[![BRSR](https://img.shields.io/badge/BRSR-Ready-8b7355?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)

<br>

> **PRAVAAH** is an evidence-driven ESG intelligence platform designed to
> transform distributed project-level sustainability data into validated
> insights, SDG alignment, BRSR readiness, predictive risk analysis,
> actionable recommendations, and trusted reporting.

<br>

</div>

---

## 🌱 What is PRAVAAH?

Large infrastructure organizations generate ESG information across hundreds
of projects, business units, subsidiaries, documents, spreadsheets, and
operational systems.

The challenge is not simply generating an ESG report.

The real challenge is:

- Where did the data come from?
- Can the data be trusted?
- Is supporting evidence available?
- Is the data compliant with reporting requirements?
- Which projects have ESG risks?
- Which SDGs are being addressed?
- Where are the gaps?
- What could happen next?
- What action should management take?
- Can the final result be traced back to its source?

**PRAVAAH addresses this complete lifecycle in one connected platform.**

---

# 🔄 The PRAVAAH Flow

```text
                    ┌───────────────────┐
                    │    PROJECT DATA   │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │   DATA VALIDATION │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │   EVIDENCE VAULT  │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │    ESG DATA LOG   │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │  DATA SUMMARIZER  │
                    └─────────┬─────────┘
                              ↓
              ┌───────────────┼────────────────┐
              ↓               ↓                ↓
        ┌──────────┐    ┌──────────┐     ┌──────────┐
        │    ML    │    │   SDG    │     │   BRSR   │
        │ Analysis │    │  Engine  │     │  Engine  │
        └────┬─────┘    └────┬─────┘     └────┬─────┘
             │               │                │
             └───────────────┼────────────────┘
                             ↓
                    ┌───────────────────┐
                    │   RAG + AI LAYER  │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │    AI INSIGHTS    │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │  RECOMMENDATIONS  │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │ MANAGEMENT ACTION │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │ ESG / BRSR REPORT │
                    └───────────────────┘
````

---

# 🏢 Organizational Intelligence

PRAVAAH is designed around a hierarchical organizational structure.

```text
                         MEIL GROUP
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        SUBSIDIARY A   SUBSIDIARY B   SUBSIDIARY C
              │              │              │
           BU A1          BU B1          BU C1
              │              │              │
          ┌───┴───┐      ┌───┴───┐      ┌───┴───┐
          ↓       ↓      ↓       ↓      ↓       ↓
       Project  Project Project Project Project Project
```

### 📊 Role Workflows — Data Flow & Governance Hierarchy

```text
DATA_CONTRIBUTOR
       ↓  (submit_to_pm: DRAFT / REVISION_REQUESTED → SUBMITTED)
PROJECT_MANAGER
       ↓  (pm_approve: SUBMITTED → PM_APPROVED)
ESG_REVIEWER
       ↓  (reviewer_approve: PM_APPROVED → REVIEWER_APPROVED)
BU_MANAGER
       ↓  (bu_approve: REVIEWER_APPROVED → BU_APPROVED)
SUBSIDIARY_MANAGER
       ↓  (subsidiary_approve: BU_APPROVED → SUBSIDIARY_APPROVED)
GROUP_ESG_MANAGER
       ↓  (group_approve / publish: SUBSIDIARY_APPROVED → GROUP_APPROVED / PUBLISHED)
EXECUTIVE / STAKEHOLDER  (Read-only access to published disclosures)
       
AUDITOR → (Reads all levels: audit trail, evidence vault & data lineage)
SUPER_ADMIN / ESG_ADMIN → (Configure periods, thresholds, user roles & monitor all levels)
```

---

### 🔄 Role-by-Role Data Flow & Work Performed

#### 1. DATA_CONTRIBUTOR
* **Where data flows:** Project level → **PROJECT_MANAGER**
* **Workflow Status Transition:** `DRAFT` / `REVISION_REQUESTED` → `SUBMITTED`
* **Work performed:**
  * Enter monthly ESG metric values (energy, water, waste, safety incidents, GHG parameters, etc.)
  * Upload supporting evidence (utility invoices, meter readings, calibration certificates)
  * Mark data entry complete and submit for project validation
  * Respond to reviewer/PM feedback queries and resubmit updated data

#### 2. PROJECT_MANAGER
* **Where data flows:** Receives from Data Contributor → Sends to **ESG_REVIEWER**
* **Workflow Status Transition:** `SUBMITTED` → `PM_APPROVED` *(or `REVISION_REQUESTED` on rejection)*
* **Work performed:**
  * Review and validate raw data entered by project contributors
  * Inspect and attach or verify supporting evidence documents
  * Fix project validation errors (missing values, wrong units, unexpected spikes)
  * Validate and submit verified project data for independent ESG review
  * Monitor project ESG performance against assigned sustainability targets

#### 3. ESG_REVIEWER
* **Where data flows:** Receives from Project Manager → Sends to **BU_MANAGER**
* **Workflow Status Transition:** `PM_APPROVED` → `REVIEWER_APPROVED` *(or `REVISION_REQUESTED` on rejection)*
* **Work performed:**
  * Verify evidence attachments against declared numbers
  * Check calculation methodologies and emission conversion factors
  * Flag anomalies (sudden consumption spikes, missing records, inconsistent units)
  * Request revisions with actionable review queries and notes
  * Approve compliant data for business unit consolidation

#### 4. BU_MANAGER
* **Where data flows:** Receives from ESG Reviewer → Sends to **SUBSIDIARY_MANAGER**
* **Workflow Status Transition:** `REVIEWER_APPROVED` → `BU_APPROVED` *(or `REVISION_REQUESTED` on rejection)*
* **Work performed:**
  * Consolidate and monitor BU-wide ESG performance across all business unit projects
  * Compare project-level performance to identify leading and lagging project sites
  * Standardize reporting formats and methodologies across projects
  * Approve BU submission for legal entity / subsidiary consolidation
  * Address compliance gaps and anomalies flagged at the BU level

#### 5. SUBSIDIARY_MANAGER
* **Where data flows:** Receives from BU Manager → Sends to **GROUP_ESG_MANAGER**
* **Workflow Status Transition:** `BU_APPROVED` → `SUBSIDIARY_APPROVED` *(or `REVISION_REQUESTED` on rejection)*
* **Work performed:**
  * Oversee legal entity / subsidiary statutory ESG compliance
  * Review consolidated BU data across all business units
  * Monitor legal entity ESG KPIs (Scope 1/2 GHG emissions, water intensity, safety lost-time)
  * Address regulatory readiness gaps (SEBI BRSR Core compliance)
  * Approve subsidiary-level disclosure for group consolidation
  * Drive subsidiary-level decarbonization and sustainability initiatives

#### 6. GROUP_ESG_MANAGER
* **Where data flows:** Receives from Subsidiary Manager → Group Reporting / Executive
* **Workflow Status Transition:** `SUBSIDIARY_APPROVED` → `GROUP_APPROVED` → `PUBLISHED` *(locks data & marks officially verified)*
* **Work performed:**
  * Group-wide ESG data consolidation across all legal subsidiaries
  * Generate official BRSR disclosures, GRI frameworks, and annual ESG filing packages
  * Group-level predictive risk assessments and compliance gap analyses
  * Track consolidated corporate sustainability goals and SDG alignment
  * Oversee statutory assurance readiness and audit preparation
  * Final approval and official publication of group sustainability disclosures

#### 7. EXECUTIVE / STAKEHOLDER
* **Where data flows:** Receives from Group ESG Manager *(read-only output)*
* **Workflow Status:** Reads `PUBLISHED` data
* **Work performed:**
  * High-level executive KPI dashboards, peer benchmarking, and enterprise risk heatmaps
  * Monitor corporate ESG scores, SDG contributions, and progress toward Net Zero
  * Review Board reports and Sustainability Committee presentations
  * Access published statutory filings and stakeholder disclosures
  * Strategic capital allocation and decision-making based on verified ESG trends

#### 8. AUDITOR
* **Where data flows:** Reads all levels *(audit trail & data lineage)*
* **Workflow Status:** Read-only access across all statuses (`DRAFT` through `PUBLISHED`)
* **Work performed:**
  * Trace any reported metric back to its original project-level source and evidence
  * Review the complete approval history (who entered, who approved, timestamps, comments)
  * Verify calculation methodologies, emission factors, and assurance standards
  * Inspect attached invoices, utility bills, and certificates in the Evidence Vault
  * Export immutable audit trail reports for SEBI reasonable assurance and external audit

#### 9. SUPER_ADMIN / ESG_ADMIN
* **Where data flows:** Oversees and configures all levels *(configuration & governance)*
* **Workflow Status:** Override authority across all workflow stages
* **Work performed:**
  * Configure reporting cycles, submission deadlines, and validation thresholds
  * Manage user roles, access control (RBAC), and project assignments
  * Set up and maintain ESG metrics, BRSR indicators, and unit standards
  * Monitor system-wide workflow progress, bottlenecks, and overdue reviews
  * Maintain system audit logs, security, and platform integrity

### Management Drill-Down & Lineage

```text
Group
   ↓
Subsidiary
   ↓
Business Unit
   ↓
Project
```

This creates bidirectional, end-to-end data integrity: project data flows upward with mandatory multi-level validations, while management and auditors can drill downward to the original source evidence.

---

# 🧩 Core Features

## 01 — ESG Data Management

Collect structured ESG information from projects.

### Environmental

* Energy consumption
* Electricity
* Fuel / Diesel
* Water consumption
* Waste generation
* Waste recycling
* Emissions
* Renewable energy
* Resource utilization

### Social

* Workforce
* Safety incidents
* Lost-time injuries
* Training
* Health & safety
* Diversity
* Community initiatives

### Governance

* Policies
* Compliance
* Ethics
* Complaints
* Governance
* Anti-corruption
* Supplier compliance

---

## 02 — Historical ESG Data Logs

PRAVAAH doesn't only store the latest value.

It maintains historical ESG records.

```text
Metric       Month       Value       Change       Status
────────────────────────────────────────────────────────
Energy       January     80,000      —            🟢
Energy       February    83,000      +3.7%        🟢
Energy       March       87,000      +4.8%        🟢
Energy       April       103,000     +18.4%       🟡
Energy       May         125,000     +21.3%       🔴
```

Historical data enables:

* Trend analysis
* Benchmarking
* Anomaly detection
* Forecasting
* Risk analysis
* AI insights

---

# 📑 03 — Evidence-Driven ESG

Every important ESG metric can be linked to supporting evidence.

```text
ESG Metric
    ↓
Evidence
    ↓
Validation
    ↓
Review
    ↓
Approval
    ↓
Audit Trail
```

Supported evidence may include:

* Invoices
* Meter readings
* Certificates
* Safety reports
* Environmental reports
* HR documents
* Supplier documents
* Photographs
* Project records

### Example

```text
Diesel Consumption
24,000 L

Evidence:
Fuel_Invoice_March.pdf

Uploaded By:
Project Data Contributor

Reviewed By:
Project Manager

Status:
✓ Approved
```

---

# 🛡️ 04 — Data Validation

Before information becomes part of the reporting pipeline,
PRAVAAH validates it.

The system can identify:

* Missing values
* Invalid units
* Negative values
* Duplicate records
* Impossible values
* Sudden changes
* Missing evidence
* Values outside defined ranges

```text
Total Records       1,250

✓ Valid              1,180
⚠ Warnings              48
✕ Errors                22
```

---

# 🔐 05 — Approval Workflow

ESG data moves through controlled organizational approval.

```text
Data Contributor
       ↓
Project Manager
       ↓
BU ESG Manager
       ↓
Subsidiary ESG Manager
       ↓
Group ESG Manager
       ↓
✓ APPROVED
```

Every transition is recorded.

---

# 🕘 06 — Complete Audit Trail

PRAVAAH maintains traceability for important data changes.

```text
Who changed it?
What changed?
Old value?
New value?
When?
Why?
Who reviewed it?
Who approved it?
What evidence supports it?
```

Example:

```text
OLD VALUE : 80,000 kWh
NEW VALUE : 92,000 kWh

Changed By : Project Manager
Timestamp  : 17 Sep 2026
Reason     : Corrected meter reading

Evidence   : Meter_September.pdf
```

---

# 🧠 07 — ESG Data Summarizer

Large organizations can generate millions of ESG records.

Instead of sending raw data directly to an LLM,
PRAVAAH creates a compact ESG context.

```text
Millions of Records
        ↓
   Data Summarizer
        ↓
Compact ESG Context
        ↓
 AI / ML / RAG
```

Example:

```text
PROJECT A

Energy
Average       : 91,200 kWh
Current       : 112,500 kWh
Change        : +23.3%
Trend         : Increasing
Anomaly       : Detected

Water
Current       : 38,200 KL
Trend         : Stable

Waste
Generated     : 150 tonnes
Recycled      : 128 tonnes
Recycling     : 85.3%

Safety
Incidents     : 2
Severity      : Medium
```

This improves context efficiency and reduces unnecessary AI processing.

---

# 🔎 08 — RAG & Semantic Knowledge

PRAVAAH uses Retrieval-Augmented Generation for
unstructured ESG and regulatory knowledge.

### Knowledge Base

* BRSR documentation
* BRSR Core
* SDG documentation
* ESG standards
* Internal ESG policies
* Environmental policies
* Safety policies
* Previous reports
* Methodology documents
* Supplier ESG policies

### Pipeline

```text
Documents
    ↓
Text Extraction / OCR
    ↓
Chunking
    ↓
Embeddings
    ↓
Vector Search
    ↓
Relevant Knowledge
    ↓
RAG
    ↓
LLM
```

For the prototype, vector search can be implemented using:

**PostgreSQL + pgvector**

---

# 🤖 09 — Hybrid AI Architecture

PRAVAAH does not depend on an LLM for everything.

Different technologies handle different responsibilities.

| Component     | Responsibility                   |
| ------------- | -------------------------------- |
| PostgreSQL    | Structured ESG data              |
| Rules Engine  | Validation & deterministic logic |
| ML            | Patterns & predictions           |
| RAG           | Knowledge retrieval              |
| Vector Search | Semantic document retrieval      |
| LLM           | Explanation & interaction        |
| Analytics     | Trends & visualization           |

### Hybrid Query

```text
User Question
      ↓
┌─────┴─────┐
↓           ↓
SQL       RAG
↓           ↓
Data     Knowledge
└─────┬─────┘
      ↓
     LLM
      ↓
Grounded Answer
```

---

# 📈 10 — AI/ML Anomaly Detection

PRAVAAH analyzes historical ESG logs to identify unusual behavior.

Example:

```text
Diesel Consumption

Jan   18,000 L
Feb   18,500 L
Mar   19,200 L
Apr   19,000 L
May   19,500 L
Jun   27,000 L  🚨
```

Possible techniques:

* Z-Score
* IQR
* Rolling Average
* Historical Baseline
* Peer Comparison
* Isolation Forest

Result:

> ⚠️ Unusual increase in diesel consumption detected.

---

# 🔮 11 — ESG Prediction

Historical data can be used to estimate future trends.

```text
Historical Data
      ↓
ML Model
      ↓
Prediction
      ↓
Potential Future Risk
```

Potential use cases:

* Energy forecasting
* Water forecasting
* Fuel forecasting
* Waste forecasting
* Emission trends
* ESG risk prediction

Predictions are presented as model estimates rather than guaranteed outcomes.

---

# 🌍 12 — SDG Alignment Engine

PRAVAAH maps measurable ESG indicators and evidence
to relevant Sustainable Development Goals.

Example:

```text
SDG 6   Clean Water                  🟢 Strong
SDG 7   Clean Energy                 🟢 Strong
SDG 8   Decent Work                  🟡 Partial
SDG 12  Responsible Consumption      🔴 Gap
SDG 13  Climate Action               🔴 Gap
```

### SDG Gap Analysis

```text
SDG 13 — CLIMATE ACTION

✓ Emissions measured
✓ Energy monitored
✕ Reduction target missing
✕ Supporting evidence incomplete

STATUS: 🔴 GAP
```

The system uses defined indicators and evidence for status determination,
while AI provides explanations and recommendations.

---

# 📋 13 — BRSR Compliance Engine

PRAVAAH maps collected information to applicable BRSR requirements.

```text
ESG Metric
    ↓
BRSR Requirement
    ↓
Required Data
    ↓
Validation
    ↓
Evidence
    ↓
Approval
    ↓
Compliance Status
```

Example:

```text
Data Available       ✓
Data Valid            ✓
Evidence Available    ✓
Approval Complete     ✓

BRSR STATUS: READY
```

Reporting configurations should be versioned by reporting period.

---

# ⚠️ 14 — ESG Risk Engine

PRAVAAH combines:

```text
Historical Data
+
Anomalies
+
Missing Evidence
+
Compliance Gaps
+
Predictions
```

to create an ESG risk view.

```text
Project A

Environmental       🟡
Social              🟢
Governance          🟢
BRSR Readiness      🟡
SDG Alignment       🟡
Evidence Coverage   🔴
```

---

# 🗺️ 15 — Risk Heatmap

Management can compare projects at a glance.

```text
Project       Environmental   Social   Governance   Overall
────────────────────────────────────────────────────────────
Project A          🟢           🟢        🟢          🟢
Project B          🟡           🟢        🟢          🟡
Project C          🔴           🟡        🟢          🔴
Project D          🟡           🔴        🟡          🔴
```

Projects can be filtered by:

* Subsidiary
* Business Unit
* Location
* Risk category
* Reporting year

---

# 💡 16 — AI Recommendations

PRAVAAH doesn't stop at identifying a problem.

It converts insights into recommended actions.

Example:

```text
⚠️ Environmental Alert

Diesel consumption increased by 31%.

Possible contributing factors:

• Increased equipment usage
• Equipment efficiency issues
• Excessive idle time

Recommended Actions:

✓ Monitor equipment idle time
✓ Schedule preventive maintenance
✓ Optimize equipment utilization
✓ Review fuel consumption weekly
```

---

# 🏢 17 — Hierarchical Recommendations

Recommendations change according to organizational level.

### Project

> Review equipment utilization and maintenance.

### Business Unit

> Standardize fuel-efficiency monitoring across projects.

### Subsidiary

> Implement a common water-management program.

### Group

> Establish a group-wide ESG improvement initiative.

```text
PROJECT
   ↓
BU
   ↓
SUBSIDIARY
   ↓
GROUP
```

---

# 🎯 18 — ESG Action Center

Recommendations can become actual tasks.

```text
AI Recommendation
        ↓
Assign Responsible Person
        ↓
Set Deadline
        ↓
In Progress
        ↓
Completed
        ↓
Verified
```

This creates a closed-loop system:

**Detect → Recommend → Act → Verify → Improve**

---

# 💬 19 — ESG AI Copilot

Ask PRAVAAH questions in natural language.

Examples:

```text
"Which projects have high environmental risk?"

"Why is Project 27 marked critical?"

"Which subsidiaries have incomplete evidence?"

"What caused the increase in water consumption?"

"Which SDGs have the largest gaps?"

"Which BRSR disclosures are incomplete?"

"What action should Project 27 take?"
```

The Copilot combines:

**Structured Data + Data Summary + ML Results + RAG Knowledge**

to provide grounded answers.

---

# 📄 20 — AI Document Intelligence

Upload an ESG document.

```text
Safety_Report_Project_27.pdf
             ↓
        AI Extraction
             ↓
┌──────────────────────────┐
│ Safety Incidents : 4     │
│ Training Hours  : 920    │
│ LTI            : 1      │
└──────────────────────────┘
             ↓
        Human Review
             ↓
        ESG Data Log
```

This can reduce repetitive manual data entry.

---

# 📊 21 — Analytics

PRAVAAH provides:

### Trends

* Energy trends
* Water trends
* Fuel trends
* Waste trends
* Emission trends

### Anomalies

Identify unusual project behavior.

### Predictions

Estimate future trends.

### Comparisons

Compare:

```text
Project vs Project
BU vs BU
Subsidiary vs Subsidiary
Current Year vs Previous Year
```

---

# 📑 22 — Report Center

Generate reports at multiple organizational levels.

```text
Project Report
       ↓
BU Report
       ↓
Subsidiary Report
       ↓
Group Report
```

Possible outputs:

* ESG Reports
* BRSR-ready reports
* SDG Reports
* Risk Reports
* Evidence Reports
* Management Summaries
* Excel exports
* PDF reports

---

# 🔗 23 — One-Click Traceability

One of PRAVAAH's key UX concepts.

Suppose management sees:

```text
🔴 Project 127
SDG 13 Gap
```

Click it:

```text
SDG 13 Gap
     ↓
Why?
     ↓
Emission intensity increased
     ↓
Show Data
     ↓
Fuel Records
     ↓
Show Evidence
     ↓
AI Analysis
     ↓
Recommendation
     ↓
Assign Action
```

### From:

**RED ALERT**

to

**ROOT CAUSE → DATA → EVIDENCE → AI → ACTION**

without losing context.

---

# 🏗️ System Architecture

```text
                         PRAVAAH
                            │
              ┌─────────────┴─────────────┐
              │                           │
       STRUCTURED DATA              DOCUMENT DATA
              │                           │
      Forms / Excel / API          PDF / DOCX / Reports
              │                           │
              ↓                           ↓
         PostgreSQL                Extraction / OCR
              │                           │
              ↓                       Chunking
         ESG Data Logs                   ↓
              │                      Embeddings
              ↓                           ↓
       Validation Engine              pgvector
              │                           │
              ↓                           ↓
       Data Summarizer ←────────── RAG Retrieval
              │                           │
              └─────────────┬─────────────┘
                            ↓
                    AI INTELLIGENCE
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
             ML            SDG           BRSR
              │           Engine         Engine
              ↓             ↓             ↓
         Prediction        Gaps        Readiness
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                       Risk Engine
                            ↓
                   Recommendation Engine
                            ↓
                 Project / BU / Subsidiary
                            ↓
                       Group Level
                            ↓
                    Report Generation
```

---

# 🛠️ Technology Stack

### Frontend

* React
* Tailwind CSS
* Recharts
* Responsive UI
* Interactive dashboards

### Backend

* Node.js
* Express.js
* REST APIs
* Authentication
* RBAC

### Database

* PostgreSQL

### Vector Search

* pgvector

### AI

* LLM
* Embeddings
* RAG

### ML

* Python
* Statistical anomaly detection
* Forecasting
* Risk analysis

### Document Processing

* PDF/DOCX/XLSX extraction
* OCR for scanned documents

### Storage

* Object/File Storage

---

# 🧠 Technology Responsibility

| Technology     | Purpose                                |
| -------------- | -------------------------------------- |
| PostgreSQL     | Structured ESG information             |
| pgvector       | Semantic document retrieval            |
| Rules Engine   | Validation & deterministic compliance  |
| Python ML      | Anomaly detection & prediction         |
| RAG            | Regulatory & ESG knowledge retrieval   |
| Embeddings     | Semantic search                        |
| LLM            | Explanation, Copilot & recommendations |
| React          | User interface                         |
| Node.js        | Backend APIs                           |
| Object Storage | Evidence & documents                   |

---

# 🔐 Security & Governance

PRAVAAH should support:

* Role-Based Access Control
* Secure authentication
* Organization-level permissions
* Project-level permissions
* Evidence access control
* Audit logs
* Data versioning
* Approval workflows
* Secure document storage

---

# 🚀 Development Roadmap

## Phase 1 — Foundation

* Authentication
* RBAC
* Organization hierarchy
* Projects
* ESG data collection
* PostgreSQL
* Historical data logs

## Phase 2 — Trust

* Validation
* Evidence Vault
* Approval workflow
* Audit trail

## Phase 3 — Compliance

* BRSR mapping
* SDG mapping
* Compliance dashboards
* Report generation

## Phase 4 — Intelligence

* Data Summarizer
* Anomaly detection
* Prediction
* Risk engine

## Phase 5 — RAG

* Document ingestion
* Chunking
* Embeddings
* pgvector
* Retrieval
* Regulatory Q&A

## Phase 6 — AI Copilot

* Natural-language queries
* AI insights
* Explanations
* Recommendations
* Document intelligence

## Phase 7 — Enterprise Experience

* Executive dashboards
* Risk heatmaps
* Action center
* Advanced analytics
* Report automation
* API integrations

---

# 🎬 Hackathon Demo Flow

The complete demonstration should follow one story:

```text
1. Login
      ↓
2. MEIL Organization
      ↓
3. Select Project
      ↓
4. View ESG Data
      ↓
5. Upload Evidence
      ↓
6. Validate Data
      ↓
7. Historical Data Log
      ↓
8. Data Summarizer
      ↓
9. ML detects anomaly
      ↓
10. Prediction
      ↓
11. SDG Gap Detection
      ↓
12. BRSR Gap Detection
      ↓
13. RAG retrieves relevant knowledge
      ↓
14. AI explains the issue
      ↓
15. AI recommends action
      ↓
16. Assign Action
      ↓
17. Verify Improvement
      ↓
18. Generate BRSR Report
```

---

# 🌊 Why PRAVAAH?

**PRAVAAH** represents the continuous flow of information.

```text
Data
 ↓
Evidence
 ↓
Knowledge
 ↓
Intelligence
 ↓
Decision
 ↓
Action
 ↓
Improvement
 ↓
Reporting
```

Like a continuous flow, ESG information moves from
individual projects to the organization and ultimately
toward sustainable decision-making.

---

# ⭐ Key Differentiators

### 01

**Project-to-Group Traceability**

### 02

**Evidence-Backed ESG Reporting**

### 03

**Historical ESG Data Intelligence**

### 04

**Data Summarization Layer**

### 05

**Hybrid SQL + ML + RAG + LLM Architecture**

### 06

**Predictive ESG Analytics**

### 07

**SDG Gap Detection**

### 08

**BRSR Readiness Monitoring**

### 09

**Hierarchical AI Recommendations**

### 10

**Closed-Loop ESG Action Management**

### 11

**Complete Auditability**

---

# 🎯 Our Vision

> ### **PRAVAAH transforms ESG reporting from a periodic reporting activity into a continuous intelligence and improvement system.**

```text
          COLLECT
             ↓
          VERIFY
             ↓
          ANALYZE
             ↓
          PREDICT
             ↓
        RECOMMEND
             ↓
           ACT
             ↓
         IMPROVE
             ↓
          REPORT
             ↺
```

---

<div align="center">

## 🌊 PRAVAAH

### Connecting Data. Driving Sustainability.

**From Every Project to One Sustainable Vision.**

<br>

Built with ❤️ for intelligent and sustainable infrastructure.

</div>
```

### Recommended GitHub structure

Don't put everything in the root. Make the repository look like an actual product:

```text
PRAVAAH/
│
├── frontend/
├── backend/
├── ml-service/
├── rag-service/
├── database/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── ai/
├── public/
│   └── pravah-logo.png
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
└── docker-compose.yml
```
