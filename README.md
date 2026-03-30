# LibrisConnect 📚
### A Multi-Tenant Collaborative Resource Ecosystem for Indian Higher Education

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-1.0.0--DRAFT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Azure-0078D4?style=for-the-badge&logo=microsoftazure" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=nextdotjs" />
</p>

---

## 🌐 Overview

**LibrisConnect** is a scalable, cloud-native SaaS platform that enables educational institutions across India to operate as independent tenants while participating in a **Shared Knowledge Grid**. The platform bridges the resource gap between Tier-1 and Tier-2/3 colleges by enabling secure inter-institutional sharing of physical and digital academic resources.

> *"A student in a village in Andhra Pradesh should have access to the same academic resources as a student at IIT Madras."*

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏛 **Multi-Tenancy** | Complete data isolation between colleges using Azure Cosmos DB partitioning |
| 🔍 **Global Search** | Semantic and fuzzy search across the entire college network via Azure AI Search |
| 📤 **Inter-Library Loans (ILL)** | Real-time request and approval workflow between institutions |
| 🔐 **Secure Digital Access** | Time-limited SAS token links for PDF previews (24-hour expiry) |
| 👥 **Role-Based Access Control** | Student, Librarian, and Super Admin roles via Microsoft Entra ID |
| 📊 **Analytics Dashboard** | Demand heatmaps and audit logs for librarians and admins |

---

## 🏗 System Architecture

LibrisConnect follows a **Multi-Tenant SaaS** architecture with a clear separation of concerns across four tiers.

```
┌────────────────────────────────────────────────┐
│              CLIENT TIER                       │
│   Next.js 15 (SSR) + TanStack Query            │
│   Tailwind CSS + Shadcn/UI                     │
└─────────────────────┬──────────────────────────┘
                      │ HTTPS
┌─────────────────────▼──────────────────────────┐
│              GATEWAY TIER                      │
│   Azure Static Web Apps (Edge + SSL)           │
└─────────────────────┬──────────────────────────┘
                      │ JWT (tenant_id, role)
┌─────────────────────▼──────────────────────────┐
│           BUSINESS LOGIC TIER                  │
│   Node.js / Express (Azure App Service)        │
│   ├── Tenant Middleware (collegeId extraction) │
│   ├── Sharing Engine (Trust Agreement checks)  │
│   └── StorageService (SAS token generation)   │
└──────┬──────────────┬───────────────┬──────────┘
       │              │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐
│ Azure       │ │ Azure Blob │ │ Azure AI       │
│ Cosmos DB   │ │ Storage    │ │ Search         │
│ (Metadata)  │ │ (PDFs)     │ │ (Indexing)     │
└─────────────┘ └────────────┘ └────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (React) | SSR for performance on low-bandwidth networks |
| Styling | Tailwind CSS + Shadcn/UI | Rapid, accessible dashboard components |
| State Management | TanStack Query | Search result caching and data fetching |
| Language | TypeScript | Type safety across the 3-member team |
| Auth (Client) | MSAL.js | Microsoft Entra ID redirect flow |

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js + Express.js | Async multi-tenant request handling |
| Validation | Zod | Schema validation for incoming resource data |
| Real-time | Socket.io / Azure SignalR | Live ILL request notifications |
| Security | Helmet.js | HTTP header hardening |
| ORM | Mongoose | MongoDB object modeling |

### Cloud Infrastructure (Azure)
| Service | Purpose |
|---|---|
| Azure Cosmos DB | Partitioned NoSQL catalog (MongoDB API) |
| Azure Blob Storage | Encrypted PDF/EPUB storage with SAS tokens |
| Azure AI Search | Semantic + fuzzy search across all resources |
| Microsoft Entra ID | Institutional SSO and multi-tenant identity |
| Azure App Service | Backend API hosting (Linux) |
| Azure Static Web Apps | Frontend hosting + edge deployment |
| Azure Cache for Redis | High-frequency search result caching |
| Azure Application Insights | API monitoring and alerting |
| GitHub Actions | CI/CD pipeline automation |

---

## 🗂 Project Structure

```
librisconnect/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── search/
│   │   │   └── admin/
│   │   ├── components/         # Reusable UI components
│   │   └── lib/                # TanStack Query hooks, utils
│   └── api/                    # Node.js / Express backend
│       ├── middleware/          # Tenant context extraction
│       ├── modules/
│       │   ├── auth/           # Entra ID + RBAC
│       │   ├── resources/      # Book CRUD
│       │   ├── requests/       # ILL state machine
│       │   ├── search/         # Azure AI Search integration
│       │   └── storage/        # Blob + SAS token service
│       └── shared/
│           └── types.ts        # Shared type definitions
├── docs/
│   ├── SRS.md
│   ├── HLD.md
│   └── API.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions pipeline
└── docker-compose.yml
```

---

## 🗃 Database Schema (Cosmos DB / MongoDB API)

### `colleges` Collection
```json
{
  "_id": "college_001",
  "name": "IIT Madras",
  "domain": "iitm.ac.in",
  "settings": {
    "allowExternalSharing": true,
    "maxLoanDays": 14
  }
}
```

### `resources` Collection *(Partition Key: `collegeId`)*
```json
{
  "_id": "book_abc123",
  "collegeId": "college_001",
  "title": "Introduction to Algorithms",
  "metadata": { "isbn": "978-0262033848", "author": "Cormen" },
  "sharing": {
    "isPublic": false,
    "sharedWith": ["college_002", "college_005"],
    "digitalAccess": "snippet_only"
  },
  "status": "available"
}
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/resources/search?q=...` | Global search across home + shared colleges | Student |
| `POST` | `/api/v1/resources` | Add a new book to college inventory | Librarian |
| `POST` | `/api/v1/requests/loan` | Request a physical/digital loan | Student |
| `PATCH` | `/api/v1/requests/:id/approve` | Approve an incoming sharing request | Librarian |
| `GET` | `/api/v1/analytics/sharing` | View sharing/borrowing statistics | Admin |

> Full API documentation available in [/docs/API.md](./docs/API.md) and via Swagger at `/api/docs`.

---

## 🔒 Security Model

- **Tenant Isolation**: `collegeId` is always extracted from the server-side JWT — never trusted from query parameters.
- **Digital Rights**: PDFs are served only via expiring Azure SAS tokens (24-hour window).
- **RBAC**: Role (`Student` / `Librarian` / `SuperAdmin`) is enforced at the middleware level on every API request.
- **Secrets Management**: All connection strings and keys are stored in Azure Key Vault — never hardcoded.
- **Data Isolation**: Cross-tenant API calls return `403 Forbidden`. All `find()` queries are globally wrapped with a mandatory tenant filter.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+`
- Docker & Docker Compose
- Azure CLI (for cloud provisioning)
- A Microsoft Azure subscription

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-org/librisconnect.git
cd librisconnect

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your Azure credentials and connection strings

# 4. Start the development environment
docker-compose up -d   # Starts local MongoDB + Redis
npm run dev            # Starts Next.js + Express concurrently
```

### Environment Variables

```env
# Azure Cosmos DB
COSMOS_DB_CONNECTION_STRING=...
COSMOS_DB_NAME=librisconnect

# Microsoft Entra ID
ENTRA_TENANT_ID=...
ENTRA_CLIENT_ID=...
ENTRA_CLIENT_SECRET=...

# Azure Blob Storage
AZURE_BLOB_CONNECTION_STRING=...
AZURE_BLOB_CONTAINER_NAME=resources

# Azure AI Search
AZURE_SEARCH_ENDPOINT=...
AZURE_SEARCH_API_KEY=...
```

---

## 🏃 Sprint Roadmap

| Sprint | Theme | Goal |
|---|---|---|
| **Sprint 1** | Foundation | Multi-tenant Auth + Azure Environment Setup |
| **Sprint 2** | Core Inventory | Librarian Dashboard + Cosmos DB CRUD |
| **Sprint 3** | Sharing Grid | Global Search + ILL Request/Approval Workflow |
| **Sprint 4** | Hardening | QA, Security Audit, Performance, UI Polish |

---

## 👥 Team & Roles

| Member | Role | Primary Focus |
|---|---|---|
| **Jeevan** | Cloud Architect & Lead Backend | Azure infrastructure, Multi-tenant security, Sharing Engine |
| **Ajay** | Product Engineer & UI/UX Lead | Next.js frontend, Search UI, Design System |
| **Prithvi** | Integration & QA Lead | Middleware, Socket.io notifications, Jira, Testing |

### Agile Ceremonies
- **Sprint Duration**: 2 weeks
- **Daily Stand-up**: 15-min sync (What did I do? What will I do? Blockers?)
- **Sprint Review**: Demo to stakeholders at end of each sprint
- **Sprint Retrospective**: Team process improvement discussion

---

## 🧪 Testing Strategy

```
tests/
├── unit/           # Jest — individual function tests (calculateFine, etc.)
├── integration/    # API + DB communication tests
├── security/       # Cross-tenant isolation & SAS token expiry tests
└── e2e/            # Playwright — full user flow automation
```

**CI/CD**: All tests run automatically via GitHub Actions on every push. A failing test blocks deployment to the Azure staging environment.

---

## 🗺 Future Roadmap

- **Phase 2** — AI-powered "Study Buddy" using Azure OpenAI to summarize academic chapters
- **Phase 3** — Integration with the National Digital Library of India (NDLI) APIs
- **Phase 4** — Offline-first Progressive Web App (PWA) for zero-internet regions

---

## 📄 Documentation

| Document | Description |
|---|---|
| [SRS v1.0](./docs/SRS.md) | Software Requirements Specification |
| [HLD](./docs/HLD.md) | High-Level System Architecture |
| [System Design](./docs/system-design.md) | ERD, Sequence, Component Diagrams |
| [API Docs](./docs/API.md) | REST endpoint reference (Swagger) |

---

## 📜 License

This project is developed as part of an academic initiative. All participating institutions are assumed to hold valid academic licenses for the digital resources they upload and share.

---

<p align="center">
  Built with ❤️ to democratize academic resources across India.
</p>