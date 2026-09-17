# 💼 CareerPulse — Job Application Tracker

A modern, full-featured **Job Application Tracker** built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. 

CareerPulse helps job seekers organize, visualize, and optimize their job search pipeline with interactive Kanban boards, data tables, pipeline analytics, milestone reminders, and instant data export.

---

## ✨ Features

### 📊 Real-Time Analytics Dashboard
- **Key Metrics & KPIs**: Track total applications, active interview pipelines, offers received, rejections, and your overall interview response rate.
- **Upcoming Milestones & Deadlines**: Never miss an upcoming interview or follow-up deadline with date-sorted schedule cards.
- **Pipeline Stage Distribution**: Visual breakdown across every stage of the recruitment funnel.
- **Recent Applications Feed**: Quick overview and access to recently applied roles.

### 📋 Dual-View Pipeline Management
- **Interactive Kanban Board**:
  - Organized across stages: `Wishlist`, `Applied`, `Screening`, `Interviewing`, `Offer`, `Rejected`, and `Ghosted`.
  - Quick stage transitions and real-time column count badges.
- **Sortable Data Table**:
  - Full tabular overview with company logos, roles, status badges, workplace types, salary ranges, and application dates.
  - Quick action buttons to view full details or jump to direct job postings.

### 🔍 Instant Search & Multi-Criteria Filtering
- **Real-Time Search**: Filter on the fly by company name, position title, location, or notes.
- **Status Filtering**: Isolate specific pipeline stages or view all applications at once.
- **Sorting**: Order by newest first, oldest first, or alphabetically by company.

### 📝 Comprehensive Application Tracking
- **Complete Job Details**:
  - Company name & position title
  - Workplace model (`Remote`, `Hybrid`, `On-site`) & Job type (`Full-time`, `Contract`, `Internship`, `Part-time`)
  - Compensation / salary range & Location
  - Application date, follow-up date, and interview schedule (with date/time picker)
  - Job posting URL, recruiter contact name, and contact email
  - Priority levels (`High`, `Medium`, `Low`)
  - Custom notes with in-modal live editing
- **Quick Status Transitions**: Update job stages directly from the detail modal or table.

### 💾 Data Portability & Demo Tools
- **Export to CSV**: Download your entire application history as a CSV spreadsheet with one click.
- **Demo Data Reset**: Quickly load pre-configured, realistic sample applications (e.g., Stripe, Vercel, Figma, Linear) to test and demo features.

### 🎨 Modern UI & UX
- **Warm & Energetic Palette**: Tailored crisp white surfaces with vibrant orange accents and emerald success highlights.
- **Micro-Interactions**: Smooth hover effects, modal transitions, and responsive navigation.
- **Toast Notifications**: Instant feedback for creating, updating, moving, or deleting applications.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Storage**:
  - **File Engine** (Default): Fast, zero-config local storage (`data/jobs.json`).
  - **PostgreSQL Support** (Optional): Direct database connectivity via `pg` pool (`lib/db.ts`).

---

## 📁 Project Structure

```text
job-application-tracker/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts         # GET (search/filter/sort) & POST (create/reset)
│   │       └── [id]/
│   │           └── route.ts     # GET, PATCH (update status/notes), DELETE
│   ├── jobs/
│   │   ├── page.tsx             # Applications management (Kanban & Table)
│   │   └── new/
│   │       └── page.tsx         # Add new application form
│   ├── globals.css              # Global styles & Tailwind configuration
│   ├── layout.tsx               # App shell, Navbar & Toast Provider
│   └── page.tsx                 # Dashboard home page (KPIs, metrics, timeline)
├── components/
│   ├── ApplicationsView.tsx     # Kanban / Table view switcher with search & filters
│   ├── DashboardView.tsx        # KPI metrics, upcoming interviews & recent jobs
│   ├── JobDetailModal.tsx       # Detail popup modal with inline status & notes editor
│   ├── JobForm.tsx              # Create & edit application form
│   ├── JobTable.tsx             # Tabular view of applications
│   ├── KanbanBoard.tsx          # Multi-stage Kanban board
│   ├── Navbar.tsx               # Top navigation bar
│   ├── StatsCard.tsx            # Analytic metric cards
│   ├── StatusBadge.tsx          # Color-coded badge for application stages
│   └── Toast.tsx                # Toast notifications context & alerts
├── data/
│   └── jobs.json                # Local JSON persistence storage
├── lib/
│   ├── db.ts                    # PostgreSQL connection pool (pg)
│   └── jobs.ts                  # Data access layer, models, seed data & CRUD methods
├── public/                      # Static assets & icons
└── package.json
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Retrieve all jobs. Supports query params: `?status=`, `?q=`, and `?sort=`. |
| `POST` | `/api/jobs` | Create a new job application, or reset demo data via `{ "action": "reset" }`. |
| `GET` | `/api/jobs/:id` | Fetch a single job application by ID. |
| `PATCH` | `/api/jobs/:id` | Update specific fields of an application (e.g. status, notes, dates). |
| `DELETE` | `/api/jobs/:id` | Delete an application by ID. |

---

## 📄 License

This project is available under the [MIT License](LICENSE).
