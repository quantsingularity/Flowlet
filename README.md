# Flowlet - Embedded Finance Platform

![CI/CD Status](https://img.shields.io/github/actions/workflow/status/quantsingularity/Flowlet/cicd.yml?branch=main&label=CI/CD&logo=github)
![Test Coverage](https://img.shields.io/badge/coverage-91%25-green)
![License](https://img.shields.io/badge/license-MIT-blue)

![Flowlet Dashboard](docs/images/dashboard.bmp)

> **Note**: This project is under active development. Features and functionalities are continuously being enhanced to improve embedded finance capabilities and user experience. The repository has been significantly updated from its original state, migrating to a more robust, containerized, and microservices-oriented architecture.

---

## Table of Contents

- [Overview](#overview)
- [Core Value Proposition](#core-value-proposition)
- [Key Features Implemented](#key-features-implemented)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Technical Architecture](#technical-architecture)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation](#documentation)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

---

## Overview

Flowlet is engineered to abstract away the complexities of financial infrastructure, allowing businesses to concentrate on their primary offerings while delivering sophisticated financial services to their customers. The platform's design prioritizes **scalability, security, and regulatory compliance**. Flowlet connects to banking partners, payment processors, card networks, and regulatory services through a unified API layer. This strategic architecture allows businesses across various sectors to embed financial services without the burden of building complex financial infrastructure from scratch or navigating the intricate regulatory landscape independently.

Flowlet maintains a **developer-first approach**, providing comprehensive documentation, SDKs, and a robust developer portal to simplify integration and accelerate time-to-market. Its modular design ensures businesses can select and implement only the necessary components, creating a tailored embedded finance solution that is flexible and scalable to meet evolving requirements.

### Key Highlights

| Highlight                           | Description                                                                                                                                  |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **Complete Embedded Finance Stack** | Provides a full range of services, including digital wallets, payment processing, card issuance, KYC/AML, and ledger management.             |
| **Cloud-Agnostic Microservices**    | Utilizes a Kubernetes-based infrastructure for high availability and horizontal scalability across any major cloud provider.                 |
| **Developer-Friendly Integration**  | Features a comprehensive API gateway, detailed SDKs, and a dedicated developer portal to ensure seamless and rapid integration.              |
| **Bank-Grade Security**             | Implements end-to-end encryption, tokenization, and comprehensive audit trails to safeguard all sensitive data and transactions.             |
| **Regulatory Compliance**           | Offers built-in workflows for adherence to critical regulatory frameworks, including GDPR, PSD2, and FinCEN.                                 |
| **AI-Enhanced Capabilities**        | Incorporates artificial intelligence for advanced fraud detection, intelligent support chatbots, and developer assistance.                   |
| **Operational Excellence**          | Achieved through robust DevOps automation, advanced observability tools (Prometheus & Grafana), and managed services for reliable operation. |

---

## Key Features Implemented

Flowlet's strength lies in its comprehensive suite of embedded finance capabilities, meticulously implemented across its microservices architecture.

| Feature Domain                 | Core Functionality                                                                                    | Key Backend Modules                                                                          |
| :----------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Digital Wallet Management**  | Wallet creation, transaction processing, multi-currency support, real-time notifications.             | `backend/src/routes/wallet.py`, `backend/src/models/account.py`, `backend/src/currency/`     |
| **Payment Processing**         | Payment routing, external gateway integration (e.g., Stripe), bank transfers, transaction validation. | `backend/src/routes/payment.py`, `backend/src/integrations/payments/`                        |
| **Card Issuance & Management** | Card lifecycle events, transaction authorization, advanced card controls.                             | `backend/src/routes/card.py`, `backend/src/models/card.py`                                   |
| **KYC/AML Compliance**         | Identity verification, sanctions screening, regulatory compliance workflows, audit trails.            | `backend/src/routes/kyc_aml.py`, `backend/src/compliance/`                                   |
| **Ledger & Accounting**        | Meticulous recording of financial transactions, double-entry accounting, auditability.                | `backend/src/routes/ledger.py`, `backend/src/models/ledger.py`, `backend/src/utils/audit.py` |
| **AI-Enhanced Services**       | Real-time fraud detection, risk assessment, and intelligent support.                                  | `backend/src/ai/`, `backend/src/ml/fraud_detection/`                                         |
| **No-Code Workflow Engine**    | Configuration and execution of custom financial rules and workflows.                                  | `backend/src/nocode/`                                                                        |

---

## Project Structure

Flowlet utilizes a monorepo structure, separating the core backend services, frontend applications, and infrastructure configurations.

| Directory         | Description                                                                               |
| :---------------- | :---------------------------------------------------------------------------------------- |
| `backend/`        | Contains the core Python microservices, shared libraries, and the main application logic. |
| `web-frontend/`   | The main web application built with React and TypeScript.                                 |
| `scripts/`        | Essential shell scripts for setup, building, and running the application.                 |
| `tests/`          | Comprehensive test suite covering unit, integration, performance, and security testing.   |
| `docs/`           | Documentation, including API reference and architecture specifications.                   |
| `infrastructure/` | Comprehensive DevOps and Infrastructure-as-Code (IaC) configurations.                     |
| `.github/`        | Configuration for GitHub Actions and repository templates.                                |

---

## Technology Stack

Flowlet is built on a modern, high-performance, and cloud-native stack.

| Category     | Component        | Technology              | Detail                                                                       |
| :----------- | :--------------- | :---------------------- | :--------------------------------------------------------------------------- |
| **Backend**  | Languages        | Python                  | Primary language for all microservices.                                      |
|              | Frameworks       | FastAPI                 | Used for building high-performance, asynchronous API endpoints.              |
|              | Databases        | PostgreSQL, Redis       | PostgreSQL for transactional data; Redis for caching and session management. |
|              | Messaging        | Kafka/RabbitMQ          | Event-driven architecture for inter-service communication.                   |
| **Frontend** | Web              | React, TypeScript       | Main framework for the web dashboard.                                        |
|              | Styling          | Tailwind CSS            | Utility-first CSS framework for rapid UI development.                        |
| **AI/ML**    | Frameworks       | PyTorch, Scikit-learn   | For training and deploying models for fraud detection and risk assessment.   |
| **DevOps**   | Containerization | Docker                  | For packaging services.                                                      |
|              | Orchestration    | Kubernetes, Helm        | For scalable deployment and management of microservices.                     |
|              | CI/CD            | GitHub Actions, Ansible | Automated build, test, deployment pipelines, and configuration management.   |
|              | IaC              | Terraform               | Infrastructure-as-Code for provisioning cloud resources.                     |

---

## Technical Architecture

Flowlet implements a **Microservices Architecture** with a strong focus on **Event-Driven Design** and **Security-by-Design**.

    Flowlet/
    ├── API Gateway (Authentication, Rate Limiting)
    ├── Frontend Application (Web)
    ├── Core Microservices
    │   ├── User Service (Auth, Profile)
    │   ├── Wallet Service (Accounts, Transactions)
    │   ├── Payment Service (Processing, Routing)
    │   ├── Card Service (Issuance, Controls)
    │   ├── Compliance Service (KYC/AML)
    │   └── Ledger Service (Accounting, Audit)
    ├── AI/ML Engine
    │   ├── Fraud Detection Service
    │   └── Risk Assessment Service
    ├── Infrastructure
    │   ├── Message Queue
    │   ├── Database Cluster
    │   └── Observability Stack (Prometheus, Grafana)
    └── Integrations Layer
        ├── Open Banking (Plaid, FDX)
        └── Payment Processors (Stripe)

---

## Installation & Setup

Flowlet supports two primary deployment environments: **Development** (local setup) and **Production** (Kubernetes/Helm).

### Prerequisites

| Requirement       | Detail                                                    |
| :---------------- | :-------------------------------------------------------- |
| **Python**        | 3.11+                                                     |
| **Node.js**       | 20+                                                       |
| **pnpm**          | Package manager for frontend dependencies.                |
| **Docker**        | Docker Engine and Docker Compose (for development setup). |
| **Kubectl, Helm** | Required for production setup.                            |

### Quick Start (Development)

The `setup.sh` script is the primary tool for environment configuration. Use the `--env development` flag for a local setup.

```bash
# Clone the repository
git clone https://github.com/quantsingularity/Flowlet.git
cd Flowlet

# Run the setup script for the development environment
./scripts/setup.sh --env development

# To start all services (backend and frontend)
./dev-start.sh
```

### Production Deployment (Kubernetes)

For production, Flowlet is designed to be deployed using Helm charts to a Kubernetes cluster.

```bash
# Run the setup script for the production environment
# This will check for kubectl/helm, create secrets, and deploy via Helm
./scripts/setup.sh --env production --namespace flowlet-prod

# To check the status of the deployment
kubectl get pods -n flowlet-prod
```

---

## Testing

Flowlet maintains a high standard of code quality with **91% test coverage**. The testing framework is comprehensive and covers all layers of the application.

| Test Type             | Location             | Purpose                                                               |
| :-------------------- | :------------------- | :-------------------------------------------------------------------- |
| **Unit Tests**        | `tests/unit/`        | Isolated testing of individual functions and classes.                 |
| **Integration Tests** | `tests/integration/` | Validating inter-service communication and external API integrations. |
| **Functional Tests**  | `tests/functional/`  | Testing core business logic and user flows.                           |
| **Performance Tests** | `tests/performance/` | Benchmarking API response times and system throughput.                |
| **Security Tests**    | `tests/security/`    | Automated checks for common security vulnerabilities.                 |

---

## CI/CD Pipeline

AlphaMind uses GitHub Actions for continuous integration and deployment:

| Stage                | Control Area                    | Institutional-Grade Detail                                                              |
| :------------------- | :------------------------------ | :-------------------------------------------------------------------------------------- |
| **Formatting Check** | Change Triggers                 | Enforced on all `push` and `pull_request` events to `main` and `develop`                |
|                      | Manual Oversight                | On-demand execution via controlled `workflow_dispatch`                                  |
|                      | Source Integrity                | Full repository checkout with complete Git history for auditability                     |
|                      | Python Runtime Standardization  | Python 3.10 with deterministic dependency caching                                       |
|                      | Backend Code Hygiene            | `autoflake` to detect unused imports/variables using non-mutating diff-based validation |
|                      | Backend Style Compliance        | `black --check` to enforce institutional formatting standards                           |
|                      | Non-Intrusive Validation        | Temporary workspace comparison to prevent unauthorized source modification              |
|                      | Node.js Runtime Control         | Node.js 18 with locked dependency installation via `npm ci`                             |
|                      | Web Frontend Formatting Control | Prettier checks for web-facing assets                                                   |
|                      | Mobile Frontend Formatting      | Prettier enforcement for mobile application codebases                                   |
|                      | Documentation Governance        | Repository-wide Markdown formatting enforcement                                         |
|                      | Infrastructure Configuration    | Prettier validation for YAML/YML infrastructure definitions                             |
|                      | Compliance Gate                 | Any formatting deviation fails the pipeline and blocks merge                            |

## Documentation

For detailed documentation, please refer to the following resources:

| Document                    | Path                 | Description                                                 |
| :-------------------------- | :------------------- | :---------------------------------------------------------- |
| **README**                  | `README.md`          | High-level overview, project scope, and quickstart          |
| **API Reference**           | `API.md`             | Detailed documentation for all API endpoints                |
| **CLI Reference**           | `CLI.md`             | Command-line interface usage, commands, and examples        |
| **Installation Guide**      | `INSTALLATION.md`    | Step-by-step installation and environment setup             |
| **User Guide**              | `USAGE.md`           | Comprehensive guide for end-users, workflows, and examples  |
| **Contributing Guidelines** | `CONTRIBUTING.md`    | Contribution process, coding standards, and PR requirements |
| **Architecture Overview**   | `ARCHITECTURE.md`    | System architecture, components, and design rationale       |
| **Configuration Guide**     | `CONFIGURATION.md`   | Configuration options, environment variables, and tuning    |
| **Feature Matrix**          | `FEATURE_MATRIX.md`  | Feature capabilities, coverage, and roadmap alignment       |
| **Troubleshooting**         | `TROUBLESHOOTING.md` | Common issues, diagnostics, and remediation steps           |

## Contributing Guidelines

We welcome contributions to Flowlet. Please follow the organization's standard contribution process:

1.  **Open an Issue:** Discuss your proposed feature or bug fix before starting work.
2.  **Fork and Branch:** Fork the repository and create a new branch for your changes.
3.  **Code Standards:** Adhere to the existing code style and ensure all tests pass.
4.  **Documentation:** Update the relevant documentation for any new features or changes.
5.  **Pull Request:** Submit a pull request with a clear description of your changes and reference the related issue.

---

## License

Flowlet is released under the **MIT License**. For full details, see the [LICENSE](LICENSE) file in the repository root.
