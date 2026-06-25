# Next.js 16 Editorial Portfolio & Blog Template

```
┌──────────────────────────────────────────────────────────┐
│  ██████╗  █████╗ ██████╗  ██████╗ ███████╗██╗   ██╗ █████╗  │
│ ██╔════╝ ██╔══██╗██╔══██╗██╔════╝ ██╔════╝╚██╗ ██╔╝██╔══██╗ │
│ ██║  ███╗███████║██████╔╝██║  ███╗█████╗   ╚████╔╝ ███████║ │
│ ██║   ██║██╔══██║██╔══██╗██║   ██║██╔══╝    ╚██╔╝  ██╔══██║ │
│ ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗   ██║   ██║  ██║ │
│  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ │
│                 - PORTFOLIO & BLOG BLUEPRINT -           │
└──────────────────────────────────────────────────────────┘
```

This is a premium, dark-mode-first **Editorial Portfolio and Blog** template. It is engineered specifically for human developers and AI coding agents (such as Gemini, Claude, or Antigravity) to fork, adapt, and build upon.

---

## ⚡ The "Fork & AI-Adapt" Workflow

You can customize this entire system in three steps:

1.  **Fork the Repository:** Create a copy of this repository on GitHub.
2.  **Declare Your Design Style:** Open [DESIGN.md](file:///w:/Personal-Brand-Website/DESIGN.md) and modify the color tokens, fonts, spacing, cards, and aesthetic guidelines to match your personal brand.
3.  **Instruct Your AI Agent:** Prompt your AI coding assistant with the following request:
    > "Please read [DESIGN.md](file:///w:/Personal-Brand-Website/DESIGN.md) to understand the design system guidelines. Then, apply these visual tokens and branding updates across [globals.css](file:///w:/Personal-Brand-Website/app/globals.css), layout files under `app/`, and Tailwind configurations in [next.config.ts](file:///w:/Personal-Brand-Website/next.config.ts)."

---

## 🗺 AI Agent Codebase Map & Entry Points

This index guides AI assistants directly to the files responsible for each subsystem:

| File / Directory | Subsystem / Function | Tech / Libraries | Customization Details |
| :--- | :--- | :--- | :--- |
| [DESIGN.md](file:///w:/Personal-Brand-Website/DESIGN.md) | **System Specification** | Markdown Token System | Define colors, fonts, and layout guidelines here first. |
| [app/globals.css](file:///w:/Personal-Brand-Website/app/globals.css) | **Global Styles** | Tailwind CSS v4 | Contains `@theme` variables, global utility overrides, and SVG noise filters. |
| [components/navigation.tsx](file:///w:/Personal-Brand-Website/components/navigation.tsx) | **Site Navigation** | React + Next Link | Top sticky header navbar links and interactive brand logo. |
| [components/footer.tsx](file:///w:/Personal-Brand-Website/components/footer.tsx) | **Global Footer** | React + SVG UI | Layout footer containing details, links, and branding references. |
| [components/interactive-background.tsx](file:///w:/Personal-Brand-Website/components/interactive-background.tsx) | **Canvas Animation** | HTML5 Canvas 2D | Draws the dynamic glowing background orbs in a `requestAnimationFrame` loop. |
| [app/about/about-client.tsx](file:///w:/Personal-Brand-Website/app/about/about-client.tsx) | **About Page (Client)** | Motion v12 | Controls viewport entrance animations, scroll-driven shine masks, and topographic SVGs. |
| [components/contact-form.tsx](file:///w:/Personal-Brand-Website/components/contact-form.tsx) | **Contact Interface** | Client React State | Built as a simulated mockup with a `1200ms` delay (no database writes). |
| [lib/blog-service.ts](file:///w:/Personal-Brand-Website/lib/blog-service.ts) | **Database Layer** | Node `fs/promises` | Reads/writes blog posts directly to a local JSON file with in-memory caching. |
| [data/articles.json](file:///w:/Personal-Brand-Website/data/articles.json) | **Blog Posts Database** | Flat-File JSON | Contains serialized data schema for all published and draft articles. |
| [app/api/ai/fill/route.ts](file:///w:/Personal-Brand-Website/app/api/ai/fill/route.ts) | **AI CMS Assistant API** | OpenRouter API | Handles markdown metadata parsing and cover photo generation via Grok. |
| [lib/auth.ts](file:///w:/Personal-Brand-Website/lib/auth.ts) | **Auth Engine** | Web Crypto API JWT | signs/verifies user sessions. Google OAuth callbacks and allowed email checks. |
| [app/api/auth/mock-login/route.ts](file:///w:/Personal-Brand-Website/app/api/auth/mock-login/route.ts) | **Dev Mode Auth Bypass** | JWT Mock Signature | Disabled in production. Allows one-click CMS access during local development. |

---

## ✦ System Architecture & Data Flow

This chart maps how the client front-end communicates with the Next.js API routes, OAuth providers, and the flat-file database:

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

## 🔍 Technical Specification

### 1. Database & Persistence Layer
*   **JSON flat-file storage:** The blog system operates without database setup. All posts are stored as a serialized JSON array at [data/articles.json](file:///w:/Personal-Brand-Website/data/articles.json).
*   **In-Memory caching:** To speed up page response times and prevent write-lock crashes, [blog-service.ts](file:///w:/Personal-Brand-Website/lib/blog-service.ts) caches reads in memory after loading them once from the disk.

### 2. Security & Authentication Framework
*   **JWT session cookies:** Access tokens are signed using the native Web Crypto API (HMAC-SHA256) and saved in the `auth_session` cookie for Edge middleware compatibility.
*   **Google OAuth validation:** Production authorization redirects to Google OAuth, verifying user details and confirming their email matches a whitelist declared in `ALLOWED_EMAILS`.
*   **Dev Mode login bypass:** When `NODE_ENV !== 'production'`, a developer login bypass is active at [/api/auth/mock-login](file:///w:/Personal-Brand-Website/app/api/auth/mock-login/route.ts). Clicking it signs a mock session token, granting quick access to the CMS dashboard without needing OAuth client credentials.

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

# Google OAuth (optional for local mock mode)
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

*   **Repository Access:** Public showcase template.
*   **Copyright:** Gargeya Sharma · [edudojo.ai](https://edudojo.ai) — All rights reserved.
