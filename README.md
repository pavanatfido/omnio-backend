# Omnio Backend 🚀

A **NestJS + Nx modular-monolith** that powers the Omnio B2B2C identity platform—KYC, verifiable credentials, org dashboards, billing, and more.  
The repo is structured so each bounded context lives in its own Nx **library**, making it trivial to extract micro-services later.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)  
2. [Tech Stack](#tech-stack)  
3. [Prerequisites](#prerequisites)  
4. [Getting Started (Local)](#getting-started-local)  
5. [Nx Workspace Basics](#nx-workspace-basics)  
6. [Generating New Libraries](#generating-new-libraries)  
7. [Scripts & Tasks](#scripts--tasks)  
8. [Environments & Secrets](#environments--secrets)  
9. [Move-to-Production Checklist](#move-to-production-checklist)  
10. [Further Docs](#further-docs)

---

## Architecture Overview

```

apps/
api-gateway/          ← single Nest “application” (entry point)
libs/
identity/             ← KYC, VC, proofs
org/                  ← org admin & roles
billing/              ← usage, invoices
notification/         ← email + push
audit/                ← append-only logs
shared-kernel/        ← value objects, base classes
infra/
cdktf/                ← CDKTF stacks (staging, sandbox, prod)
docs/
ADR/ …                ← Architecture Decision Records (ADR-0001 etc.)

````

* Nx enforces boundaries via path aliases & eslint rules.  
* Ports / Adapters (hexagonal) pattern lets us swap vendors (KYC, billing, push) with one DI binding change.  
* CDKTF provisions VPC, EC2 ASG, Parameter Store, S3 Circuit CDN, and ALBs in **AWS**.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Language | **TypeScript 5 / Node 20** | First-class Nest support |
| Framework | **NestJS 11** | Modular, DI container, micro-service ready |
| Workspace tool | **Nx (OSS CLI only)** | Affected graph, generators, lint boundaries |
| Tests | Jest 29 + ts-jest | Fast & typed |
| Lint / Format | ESLint + Prettier | Unified style |
| IaC | CDKTF (TS) | Reuse TS skills, constructs |
| DB | Postgres (RDS) | Relational, ACID |
| Secrets | AWS SSM Parameter Store | Encrypted, versioned |
| Email | AWS SES | Same region; no 3rd-party |
| CI/CD | GitHub Actions | Built-in OIDC to AWS |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node** | 20 LTS | <https://nodejs.org> |
| **pnpm** | 8.x | `npm i -g pnpm` |
| **Nx CLI** | 18+ | `npm i -g nx` |
| **AWS CLI v2** | & AWS SSO profile | <https://docs.aws.amazon.com/cli/> |
| **CDKTF CLI** | 0.20+ | `npm i -g cdktf-cli` |
| Docker Desktop | latest | Local Postgres + LocalStack |

---

## Getting Started (Local)

```bash
git clone https://github.com/pavanatfido/omnio-backend.git
cd omnio-backend
pnpm install

# spin Postgres, LocalStack (SES + S3 mock) & other required tools
make dev

# run the app
npx nx serve api-gateway
# access the server at http://localhost:3000/api
````

> **Local env file**
> Copy `.env.local.example` → `.env.local`; no real secrets are required for dev.

---

## Nx Workspace Basics

| Task                                      | Command                     |
| ----------------------------------------- | --------------------------- |
| Show project graph                        | `npx nx graph`                  |
| Run unit tests for changed libs           | `npx nx affected -t test`       |
| Build only things affected by last commit | `npx nx affected -t build`      |
| Run lint on all projects                  | `npx nx run-many -t lint --all` |

---

## Generating New Libraries

```bash
# interactive (recommended)
npx nx g @nx/nest:lib libs/<name>  
# enter name when prompted (e.g. payments)
```

Create controller / service inside that lib:

```bash
npx nx g @nx/nest:controller /libs/<library-name>/src/lib/<controller-name>
npx nx g @nx/nest:service /libs/<service-name>/src/lib/<controller-name>
```

Then import module inside **`api-gateway`** `AppModule`.

---

## Scripts & Tasks

| Script                           | What it does                         |
| -------------------------------- | ------------------------------------ |
| `make dev`                       | Docker-compose Postgres + LocalStack + other tools |
| `nx serve api-gateway`           | Dev server (hot-reload)              |
| `nx build api-gateway`           | Compiles to `dist/apps/api-gateway`  |
| `nx test <project>`              | Jest unit tests                      |
| `nx lint`                        | ESLint across repo                   |
| `nx affected -t build,test,lint` | Used in CI                           |

---

## Environments & Secrets

* **Parameter Store path convention** `/omnio/<env>/<VAR_NAME>`
* `NODE_ENV` ⇢ `local | staging | sandbox | prod`
* Bootstrap SSM params via `infra/scripts/bootstrap-ssm.ts`.
* Loader: `libs/config/src/ssm.loader.ts` runs before Nest boots.

---

## Move-to-Production Checklist

| Step                                | Doc                                                              |
| ----------------------------------- | ---------------------------------------------------------------- |
| 1. **Merge → `main`**               | GitHub Action `ci-cd.yml` auto-builds & deploys.                 |
| 2. **CDKTF deploy** (infra changes) | `docs/infra/deploy.md`                                           |
| 3. **DB migrations**                | `libs/org/src/prisma/migrations/…`—run via `nx run migrate:prod` |
| 4. Smoke test                       | Postman collection `docs/postman/prod_smoke.json`                |
| 5. Tag release                      | `v1.x.y`—workflow pushes Docker image `omnio-api:v1.x.y`         |

Full SOP → ToDo

---

## Further Docs

* **System design brief** (Figma screens) → ToDo
* **Expansion planning doc (B2B2C)** → ToDo
* **ADR index** → ToDo
* **Infrastructure guide** → ToDo

