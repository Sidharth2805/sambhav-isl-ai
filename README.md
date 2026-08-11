# Accessible Connect

Accessible Connect is a production-quality accessibility communication platform designed to enable seamless, barrier-free communication between individuals using diverse modalities: voice, video, text, real-time captions, and Indian Sign Language (ISL) animations.

This repository is structured as a modular monolith to serve as a high-performance MVP.

---

## 1. Project Overview & Status

* **Current Phase:** Phase 1 — Project Initialization and Architectural Foundation
* **Status:** Scaffolding complete, dev environments prepared, base designs & routing operational. No actual communication services or databases are initialized or mocked in code yet.
* **Goal of Current Phase:** Create a highly accessible, production-ready, clean scaffolding that establishes the communication contracts, UI guidelines, and module boundaries for future phases.

---

## 2. Technology Stack

### Frontend
* **Core:** React 18+ (TypeScript), Vite
* **Styling:** Tailwind CSS v3, PostCSS, Autoprefixer
* **Router & Animation:** React Router v6, Framer Motion
* **Accessibility:** Native focus management, high-contrast and text-zoom accessibility states.

### Backend
* **Core:** Java 21, Spring Boot 3.4.13, Maven
* **Dependencies Prepared:** Spring Web, Spring Validation, Spring Security, WebSocket, PostgreSQL, Spring Data JPA

### Database
* **PostgreSQL:** Prepared in application properties with configurable settings via environment variables.

---

## 3. Repository Structure

```
accessible-connect/
│
├── frontend/             # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/   # Reusable UI elements (accessibility support built-in)
│   │   ├── layouts/      # Site layouts (Header, Footer, Accessible Container)
│   │   ├── pages/        # Route page targets (Landing page, placeholders)
│   │   ├── routes/       # Route definition mappings
│   │   ├── styles/       # Tailwind index.css and design tokens
│   │   └── App.tsx       # Main router and state entry point
│   └── package.json
│
├── backend/              # Spring Boot application (Maven)
│   ├── src/main/java/com/accessibleconnect/backend/
│   │   ├── config/       # Security, CORS, and Data configurations
│   │   ├── health/       # Backend health endpoint controllers
│   │   └── [modules]/    # Placeholder architectural boundaries for future phases
│   └── pom.xml
│
├── docs/                 # Architectural specifications
│   └── architecture.md
│
├── .env.example          # Template for required environment variables
├── .gitignore            # Git exclusion rules
└── README.md             # This document
```

---

## 4. Prerequisites

To run and compile the components, you need:
1. **Java JDK 21** or higher.
2. **Apache Maven 3.8+** (for managing backend builds).
3. **Node.js v18+** & **npm** (for managing frontend packages).
4. **PostgreSQL 14+** (Optional for Phase 1; the backend is configured to bypass database failure on boot to support standalone testing).

---

## 5. Setup & Running Instructions

### Step 1: Environment Configuration
1. Copy the `.env.example` file in the root to create a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the credentials in `.env` to match your local setup. Note that in Phase 1, these credentials can remain placeholders since PostgreSQL is configured not to block application boot.

### Step 2: Running the Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Compile and package the application:
   ```bash
   mvn clean compile
   ```
3. Start the application:
   * **Windows (PowerShell with .env loader):**
     You can load variables from your `.env` file and run:
     ```powershell
     # From root directory:
     .\run-backend.ps1
     ```
     *(Or manually set variables in your command session before running `mvn spring-boot:run`)*
   * **Direct Maven Boot:**
     ```bash
     mvn spring-boot:run
     ```
4. Verify backend status by accessing the health check:
   * URL: `http://localhost:8080/api/health`
   * Method: `GET`
   * Expected Response: `{"status":"UP","service":"accessible-connect-backend"}`

### Step 3: Running the Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Build the application (production compile verification):
   ```bash
   npm run build
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 6. MVP Development Roadmap

* **Phase 1 (Current):** Project Initialization, Architectural Scaffolding, Accessibility & Styling Systems, Simplified Health, Router & Page Placeholders.
* **Phase 2 (Future):** User & Profile Management, Authentication Foundations, Database Schema Migration.
* **Phase 3 (Future):** Speech-to-Text Integration, Live Captioning.
* **Phase 4 (Future):** LiveKit Integration for Audio/Video Streams, WebSockets Real-Time sync.
* **Phase 5 (Future):** ISL Translation Subsystem & Realistic Avatar Presenter.
* **Phase 6 (Future):** Administration Console & Full Accessibility Audits.
