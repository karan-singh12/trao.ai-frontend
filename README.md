# Trao.ai — Frontend Service & Study Studio

> **Modern, Interactive Interview Preparation Studio (`FS-AI-INTERVIEW-01`)**  
> Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Provides an interactive kit builder, day-by-day study schedule tracker, active-recall flashcard runner, and real-time generation feedback.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

---

## 📑 Table of Contents
1. [Key Features & User Flows](#-key-features--user-flows)
2. [The Builder: Interactive State Customization](#-the-builder-interactive-state-customization)
3. [Day-by-Day Study Schedule & Practice Studio](#-day-by-day-study-schedule--practice-studio)
4. [Active-Recall Flashcards Engine](#-active-recall-flashcards-engine)
5. [Architecture & Project Structure](#-architecture--project-structure)
6. [Getting Started & Local Setup](#-getting-started--local-setup)

---

## ✨ Key Features & User Flows

- **Instant Kit Generation Studio (`/dashboard/create`)**:
  - Live progress stepper tracking the 9 discrete backend pipeline stages (Sanitize $\rightarrow$ Extract $\rightarrow$ Crawl $\rightarrow$ Synthesize $\rightarrow$ Audit $\rightarrow$ Schedule).
  - Validates Job Description, Company URL, and study availability ($1$ to $60$ days).
- **Interactive Kit Review & Builder (`/dashboard/practice`)**:
  - **Category-Based Filtering**: Filter questions by `Technical`, `System Design`, `Behavioural`, and `Company Fit`.
  - **Inline Editing & Locking**: Edit question prompts, tailor model answer outlines, and pin critical questions.
  - **Lossless Category Regeneration**: Trigger single-category regenerations that protect pinned/edited questions.
- **Calendar & Schedule Studio (`/dashboard/schedule`)**:
  - Day-by-day allocation view displaying strictly integer study minutes and mapped question IDs.
  - Harder ($L3$) concepts prioritized early in the prep cadence.
- **Flashcard Active-Recall Runner**:
  - Flip-card interface mapped to explicit job requirements.
  - Tracks mastery state, self-assessment scoring, and spaced repetition.
- **Kit Management & Archive (`/dashboard/archive`, `/dashboard`)**:
  - Grid and List views with search, difficulty filters, and role tags.
  - Export kits to formatted JSON (Appendix A standard) or Markdown.

---

## 🛠️ The Builder: Interactive State Customization

The Builder solves **"The Hardest State Problem"** on the client side:
1. **Provenance Badges**: Visual indicators for `Edited`, `Pinned`, and `Custom` questions.
2. **Selective Pinning**: Candidate can lock essential questions before running a category refresh.
3. **Lossless Synchronization**: When a user modifies a question, the client updates the provenance state (`isEdited: true`, `isPinned: true`) and sends a `PATCH` request to the backend.
4. **Targeted Regeneration**: Candidate can click **"Regenerate Category"** to refresh unpinned questions without losing customized answers or affecting other categories.

---

## 📁 Architecture & Project Structure

```
frontend/
├── public/                     # Static assets, logos, default avatars
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root application layout & font setup
│   │   ├── page.tsx            # Marketing landing page
│   │   ├── login/              # Authentication & login flow
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout with protected route guard
│   │       ├── page.tsx        # Dashboard home (all kits, metrics overview)
│   │       ├── create/         # Kit creation stepper & URL scraper form
│   │       ├── practice/       # The Builder & question practice studio
│   │       ├── schedule/       # Calendar & day-by-day study timetable
│   │       └── archive/        # Past kits archive & search management
│   ├── components/
│   │   ├── Navbar.tsx          # Global navigation bar with user profile
│   │   ├── ProtectedRoute.tsx  # Client-side auth protection guard
│   │   └── dashboard/
│   │       ├── DashboardHeader.tsx
│   │       ├── FilterToolbar.tsx
│   │       ├── KitCardGrid.tsx
│   │       ├── KitCardList.tsx
│   │       └── MetricsGrid.tsx
│   ├── services/               # API client services connecting to backend
│   └── types/                  # TypeScript interface definitions
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Backend Service**: Running on `http://localhost:5000`

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.
