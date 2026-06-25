# THE ADVERSARY REPORT · SYSTEM BLUEPRINTS & AUDIT

```
┌──────────────────────────────────────────────────────────┐
│  ██████╗  █████╗ ██████╗  ██████╗ ███████╗██╗   ██╗ █████╗  │
│ ██╔════╝ ██╔══██╗██╔══██╗██╔════╝ ██╔════╝╚██╗ ██╔╝██╔══██╗ │
│ ██║  ███╗███████║██████╔╝██║  ███╗█████╗   ╚████╔╝ ███████║ │
│ ██║   ██║██╔══██║██╔══██╗██║   ██║██╔══╝    ╚██╔╝  ██╔══██║ │
│ ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗   ██║   ██║  ██║ │
│  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ │
│                 - SYSTEM AUDIT & ARCHITECTURE -          │
└──────────────────────────────────────────────────────────┘
```

Welcome to the **Adversary System Deconstruction & Architectural Guide** for Gargeya Sharma's personal website. This document represents a technically rigorous, fluff-free audit of the codebase, its features, backend mechanics, security models, and frontend layout structures.

---

## ✦ System Architecture & Data Flow

Below is the verified structural topology of the application's routes, security gates, and storage modules:

```
                                 [ CLIENT BROWSER ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         [ Public Pages ]                               [ Protected CMS ]
  (Home, About, Blog, Contact, etc.)                       (/editorial)
                 │                                               │
                 │                                       [ Auth Check: JWT ]
                 │                                      (Cookie: auth_session)
                 │                                               │
                 ▼                                       ┌───────┴───────┐
    [ Client Canvas Glow ]                               ▼               ▼
   [ Scroll Shine Sweep ]                          [ Authorized ]  [ Unauthorized ]
   [ Topo SVG Ellipses ]                                 │               │
  [ Contact Form (Mock) ]                                │        (Redirect /login)
                 │                                       │
                 ▼                                       ▼
          [ Read APIs ]                           [ Write APIs ]
          (/api/blog)                         (Create/Update Post)
                 │                                       │
                 │   ┌───────────────────────────────────┤
                 ▼   ▼                                   ▼
        ┌─────────────────┐                     ┌─────────────────┐
        │  Local Storage  │                     │   OpenRouter    │
        │  articles.json  │                     │   AI Engine     │
        └─────────────────┘                     └─────────────────┘
```

---

## 🔍 Technical Component Audit

### 1. Database & Persistence Layer
*   **JSON flat-file storage:** The application rejects heavy database overhead. All blog posts are serialized to a local JSON file at [data/articles.json](file:///w:/Personal-Brand-Website/data/articles.json).
*   **Memory-cached reads:** To guarantee sub-millisecond page delivery and prevent runtime crashes in write-protected host environments, [blog-service.ts](file:///w:/Personal-Brand-Website/lib/blog-service.ts) caches reads in-memory after the initial filesystem fetch.

### 2. Security & Authentication Framework
*   **Edge-runtime compatible JWT:** Session validation is managed using raw JSON Web Tokens signed and verified on Next.js Edge/Middleware routing layers via the native Web Crypto API (HMAC-SHA256).
*   **Google OAuth validation:** Production access to `/editorial` relies on Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) validating the user's profile and matching their email against a whitelist defined in the `ALLOWED_EMAILS` environment variable.
*   **Local development bypass:** When running in dev mode (`process.env.NODE_ENV !== 'production'`), the system enables a Mock Login endpoint at [/api/auth/mock-login](file:///w:/Personal-Brand-Website/app/api/auth/mock-login/route.ts). This bypass automatically signs a JWT using a fallback secret and assigns an `auth_session` cookie for local CMS testing.

### 3. Artificial Intelligence Engine
*   **OpenRouter metadata generation:** The metadata generator in [/api/ai/fill](file:///w:/Personal-Brand-Website/app/api/ai/fill/route.ts) utilizes the OpenRouter API (configured via `OPENROUTER_API_KEY`, defaulting to `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`) to read article drafts and programmatically return titles, URL slugs, summaries, categorizations, and SVG design blueprints.
*   **Grok cover-image generation:** Integrates OpenRouter's `x-ai/grok-imagine-image-quality` model to compile descriptive text prompts, generate base64 assets, and save files directly to the public disk at `/covers`.
*   *Note: While `@google/genai` is listed in the dependencies in [package.json](file:///w:/Personal-Brand-Website/package.json), the active system routes execute prompts purely via the OpenRouter API.*

### 4. Interactive & Visual Systems
*   **HTML5 Canvas backdrop:** The primary layout runs an ambient glow animation in [interactive-background.tsx](file:///w:/Personal-Brand-Website/components/interactive-background.tsx) rendering moving particles with random velocities onto a 2D canvas context wrapped in a `requestAnimationFrame` loop.
*   **Scroll-driven shine sweep:** The invitation block inside [about-client.tsx](file:///w:/Personal-Brand-Website/app/about/about-client.tsx) leverages scroll velocity tracking to animate a linear gradient mask over body copy as the element moves through the viewport.
*   **Topographic vector contours:** Placed in the negative space between glass containers, these SVGs consist of overlapping nested ellipses with offset opacity factors (`0.55` and `0.45`) rotated precisely along the card diagonal stagger.
*   **Aesthetic boundaries:** Standardized card elements use `backdrop-blur-xl`, `bg-white/[0.02]`, and inline SVG filters providing a grainy physical paper texture overlay.

### 5. Interaction Simulation (Mocks)
*   **Contact Form:** Submissions inside [contact-form.tsx](file:///w:/Personal-Brand-Website/components/contact-form.tsx) are fully simulated. When submitted, the UI transitions state after a static `1200ms` timeout without executing network POSTs or disk writes.

---

## ⚡ Tech Stack Inventory

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `^16.2.7` |
| **View Layer** | React | `^19.2.1` |
| **Language** | TypeScript | `5.9.3` |
| **Styling** | Tailwind CSS (PostCSS plugin) | `4.1.11` |
| **Animations** | Motion (v12 core) | `^12.23.24` |
| **Forms / Checkers** | React Hook Form + Zod | `v5` / `v3` |
| **Icons** | Lucide React | `^0.553.0` |

---

## ⚙️ Environment Variables Config

Create a `.env` file in the root directory based on the variables declared below:

```env
# URL for callbacks and redirection sanitization
APP_URL="http://localhost:3000"

# OpenRouter configuration for metadata fill & cover images
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

# Session encryption secret (fallback defaults to dev secret if undefined)
JWT_SECRET="your-secure-jwt-random-string"

# Production Google OAuth (optional for local mock mode)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Comma-separated whitelist of emails permitted to access CMS in production
ALLOWED_EMAILS="email1@domain.com,email2@domain.com"
```

---

## 🛠 Setup & Local Execution

### Prerequisites
*   Node.js 18.x or higher
*   npm or yarn

### 1. Installation
Clone the repository and install the development packages:
```bash
git clone https://github.com/Gargeya-Grey/Personal-Brand-Website.git
cd Personal-Brand-Website
npm install
```

### 2. Configure Environment
Generate your `.env` and fill in the required variables:
```bash
cp .env.example .env
```

### 3. Execute Development Server
Start the local server running with Next.js Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the client.

### 4. Build Production Bundle
Build and verify static asset compiles:
```bash
npm run build
```

### 5. Utility Scripts
*   `npm run lint` — Runs ESLint code style check
*   `npm run clean` — Deletes local next cache folders
*   `npm run start` — Boots compiled production server

---

## 📄 License & Access Control

*   **Repository Access:** Public showcase.
*   **Copyright:** Gargeya Sharma · [edudojo.ai](https://edudojo.ai) — All rights reserved.
