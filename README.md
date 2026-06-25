
<div align="center">

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    ██████╗  █████╗ ██████╗  ██████╗ ███████╗██╗   ██╗  ║
║   ██╔════╝ ██╔══██╗██╔══██╗██╔════╝ ██╔════╝╚██╗ ██╔╝  ║
║   ██║  ███╗███████║██████╔╝██║  ███╗█████╗   ╚████╔╝   ║
║   ██║   ██║██╔══██║██╔══██╗██║   ██║██╔══╝    ╚██╔╝    ║
║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗   ██║     ║
║    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝     ║
║                                                          ║
║         Personal Brand Website · edudojo.ai             ║
╚══════════════════════════════════════════════════════════╝
```

**The Digital Sensei** · AI Educator · Builder · Mentor

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Motion-12-FF0055?style=for-the-badge&logo=framer)](https://motion.dev)

</div>

---

## ✦ What is this?

This is the **personal brand website** — a dark-mode-first, AI-powered, scroll-animated portfolio and blog platform built to feel as premium as the ideas it communicates. It's where deep technical writing meets editorial design.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🏠 Home        → Animated hero + featured work       │
│   👤 About       → Philosophy, journey & craft          │
│   📝 Blog        → Full CMS-backed editorial blog       │
│   🎥 YouTube     → Curated video content grid           │
│   🤝 Community   → Ways to connect and collaborate      │
│   ✉️  Contact     → Smart contact form                  │
│   🔐 Editorial   → Private CMS for writing & drafts    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS v4 + Vanilla CSS |
| **Animations** | Framer Motion 12 (scroll-driven, viewport-aware) |
| **AI** | Google Gemini API (`@google/genai`) |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Vercel / Cloud Run compatible |

---

## 🗂 Project Structure

```
Personal-Brand-Website/
│
├── app/                        # Next.js App Router
│   ├── page.tsx                # 🏠 Home — animated hero, featured projects
│   ├── about/
│   │   ├── page.tsx            # About shell
│   │   └── about-client.tsx    # 👤 Full client-side about with animations
│   ├── blog/
│   │   ├── page.tsx            # 📝 Blog listing (dynamic CMS count)
│   │   └── [slug]/page.tsx     # Individual blog post (SSG)
│   ├── youtube/page.tsx        # 🎥 YouTube grid
│   ├── community/page.tsx      # 🤝 Community page
│   ├── contact/page.tsx        # ✉️  Contact
│   ├── editorial/              # 🔐 Private CMS dashboard
│   ├── login/                  # Auth
│   └── api/                    # API routes (blog, auth, AI)
│
├── components/                 # Shared UI components
│   ├── footer.tsx
│   ├── interactive-background.tsx
│   ├── featured-projects.tsx
│   ├── render-illustration.tsx
│   └── youtube-grid.tsx
│
├── data/
│   └── projects.ts             # Featured projects data
│
├── lib/                        # Utilities & helpers
├── hooks/                      # Custom React hooks
├── public/                     # Static assets
│
├── DESIGN.md                   # 🎨 Full design system specification
├── .env.example                # Environment variable template
└── next.config.ts
```

---

## 🎨 Design System

The site uses the **Edudojo.ai Design System** — built around three principles:

```
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │  Soft Minimalism │   │   Dark Mode First │   │ Fluid Animations │
  │                  │   │                  │   │                  │
  │  Less abstraction│   │  #1F2938 base    │   │  Scroll-driven   │
  │  More structure  │   │  #10B981 accent  │   │  Viewport-aware  │
  └──────────────────┘   └──────────────────┘   └──────────────────┘
```

**Typography**
- `Lato` — Branding & display
- `Rethink Sans` — UI body text
- `Google Sans Flex` — Editorial headlines

**Accent Colour** — `#10B981` Algorithmic Mint 🌿

**Glass Cards** — `backdrop-blur-xl` + `bg-white/[0.02]` + subtle grain texture overlay

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Gemini API key ([get one free](https://aistudio.google.com))

### 1. Clone

```bash
git clone https://github.com/Gargeya-Grey/Personal-Brand-Website.git
cd Personal-Brand-Website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env
```

Then fill in your `.env`:

```env
# Required — powers the AI fill assistant in the editorial CMS
GEMINI_API_KEY="your-gemini-api-key"

# The URL your app is hosted at
APP_URL="http://localhost:3000"

# Optional — for AI-generated article metadata
OPENROUTER_API_KEY="your-openrouter-key"
OPENROUTER_MODEL="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📜 Available Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint check
npm run clean    # Clean Next.js cache
```

---

## ✨ Key Features

### 🖥 Home
- Animated hero section with scroll-triggered entrance
- Featured projects showcase
- Interactive ambient background

### 👤 About
- Scroll-driven **shine sweep animation** on the invitation text
- Three staggered glass cards: *Journey*, *Craft*, *Philosophy*
- **Topographic contour rings** in the negative space — two clusters of nested ellipses anchored to each card's position, rotated along the stagger diagonal
- 4px vertical divider in the Engineering Philosophy section

### 📝 Blog
- Full **SSG blog** with dynamic routes (`/blog/[slug]`)
- **Dynamic post count** — the "9 Musings" figure is computed live from CMS data
- Editorial hero with custom SVG illustration
- Individual post pages with rich typography

### 🔐 Editorial CMS
- Private dashboard for drafting and publishing blog posts
- **AI-assisted writing** — Gemini API fills in metadata, summaries, and tags
- Auth-protected routes

### 🎥 YouTube
- Curated video grid pulled from channel data

---

## 🌐 Deployment

This project is compatible with **Vercel** (recommended) and **Google Cloud Run**.

### Vercel (one-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gargeya-Grey/Personal-Brand-Website)

Set the same environment variables from `.env.example` in your Vercel project settings.

---

## 📁 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI features |
| `APP_URL` | ✅ Yes | Base URL of the deployed app |
| `OPENROUTER_API_KEY` | Optional | For AI metadata generation in editorial |
| `OPENROUTER_MODEL` | Optional | Model ID for OpenRouter (defaults to free tier) |

---

## 🤝 Contributing

This is a personal brand site, so direct contributions aren't expected — but if you spot a bug or have a suggestion, feel free to open an issue.

---

## 📄 License

Personal project — all rights reserved.

---

<div align="center">

```
  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
        Built with care by Gargeya · edudojo.ai
  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
```

*"It's not just about writing code; it's about shaping  
the way we think about systems and the future we are building together."*

</div>
