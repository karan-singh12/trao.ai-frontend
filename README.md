# PrepKit.ai — Frontend Service & Study Studio

> **Modern, Interactive Interview Preparation Studio (`FS-AI-INTERVIEW-01`)**  
> Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Provides an interactive kit builder, day-by-day study schedule tracker, active-recall flashcard runner, and real-time generation feedback.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

---

## Table of Contents
1. [Authentication, Login & Route Protection (Section 1)](#authentication-login--route-protection-section-1)
2. [Key Features & User Flows (Sections 2–8)](#key-features--user-flows-sections-28)
3. [The Builder: Interactive State Customization](#the-builder-interactive-state-customization)
4. [Day-by-Day Study Schedule & Practice Studio](#day-by-day-study-schedule--practice-studio)
5. [Active-Recall Flashcards Engine](#active-recall-flashcards-engine)
6. [Architecture & Project Structure](#architecture--project-structure)
7. [Getting Started & Local Setup](#getting-started--local-setup)

---

## Authentication, Login & Route Protection (Section 1)

As mandated by **Section 1: Authentication & User Isolation**, the frontend delivers an isolated, secure, and intuitive onboarding and login experience.

### 1. User Flows & Pages
- **Candidate Login (`/login`)**:
  - Email and password input with client-side format validation.
  - Password reveal toggle for accessibility.
  - Inline error banners and validation alerts powered by the `Alert` component.
  - Loading indicators to prevent double submission.
  - Auto-redirects already-logged-in candidates straight to `/dashboard`.
- **Candidate Registration (`/signup`)**:
  - Direct account creation communicating with `POST /api/user/signup`.
  - Immediate login session initialization upon successful registration.
- **Global Header & Logout (`Navbar.tsx`)**:
  - Shows authenticated user's email badge and quick-actions.
  - Single-click **"Sign Out"** calling `AuthService.logout()` to purge credentials and redirect to `/login`.

### 2. Session Architecture (`AuthContext.tsx`)
```
[Browser LocalStorage] ◄─── Stores JWT ('prepkit_token') & User Object
         ▲
         │ (Hydrates on mount)
         ▼
[AuthProvider Context] ───► Verifies via `GET /api/user/me`
         │
         ├── user: User | null
         ├── token: string | null
         ├── isAuthenticated: boolean
         └── login(), signup(), logout()
```
- **Automatic Session Restoration**: On initial app load, `AuthContext` reads the persisted token from `localStorage` and immediately verifies it against `GET /api/user/me`.
- **Graceful Token Expiry**: If the token has expired (HTTP 401), the context automatically wipes stale credentials (`clearSession()`) and cleanly resets the UI state without unhandled exceptions.

### 3. Route Guard (`ProtectedRoute.tsx`)
All private workspace routes (`/dashboard/*`) are wrapped in `ProtectedRoute`:
- Unauthenticated visitors attempting to access `/dashboard`, `/dashboard/create`, `/dashboard/practice`, or `/dashboard/schedule` are immediately redirected to `/login`.
- Displays an animated loading spinner during auth hydration to eliminate page flashes or UI flicker.

---

## Key Features & User Flows (Sections 2–8)

- **Instant Kit Generation Studio (`/dashboard/create`)**:
  - Live progress stepper tracking the 8 discrete backend pipeline stages (Validate -> Extract -> Crawl -> Synthesize -> Questions -> Flashcards -> Coverage Audit -> Schedule).
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

## The Builder: Interactive State Customization

The Builder solves **"The Hardest State Problem"** on the client side:
1. **Provenance Badges**: Visual indicators for `Edited`, `Pinned`, and `Custom` questions.
2. **Selective Pinning**: Candidate can lock essential questions before running a category refresh.
3. **Lossless Synchronization**: When a user modifies a question, the client updates the provenance state (`isEdited: true`, `isPinned: true`) and sends a `PATCH` request to the backend.
4. **Targeted Regeneration**: Candidate can click **"Regenerate Category"** to refresh unpinned questions without losing customized answers or affecting other categories.

---

## Architecture & Project Structure

```
frontend/
├── public/
│   ├── prepkit-icon.png
│   ├── prepkit-logo.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── archive/
│   │   │   ├── create/
│   │   │   ├── practice/
│   │   │   ├── schedule/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── kit/
│   │   ├── schedule/
│   │   └── Navbar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── auth.service.ts
│   │   └── kit.service.ts
│   └── types/
```

---

## Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Backend Service**: Running locally on `http://localhost:5000` or hosted instance

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Configuration (`.env.local`)
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm start
```
