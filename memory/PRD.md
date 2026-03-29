# ReportBridge - PRD & Project Memory

## Problem Statement
Build a micro-SaaS app called ReportBridge that turns messy CSV exports into clean client-ready reports in minutes for small marketing agencies.

## Architecture
- **Frontend**: React + React Router v7 + Tailwind CSS + Recharts + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB) + PyJWT + bcrypt
- **Database**: MongoDB (reportbridge_db)
- **Auth**: JWT via httpOnly cookies (access: 8h, refresh: 7d)

## Design System
- **Concept**: Browser-Core Modernism (DevTools UI)
- **Fonts**: Inter (UI), JetBrains Mono (data/labels/code)
- **Accent**: #06B6D4 (cyan)
- **Background**: #f3f4f6, Panels: #ffffff, Borders: #e5e7eb
- **Layout**: Browser chrome frame + 3-panel IDE (256px left, flex center, 320px right)

## What's Been Implemented (Feb 2026)
- [x] JWT auth (register, login, logout, /me, refresh)
- [x] Admin seed + Demo user seed (demo@reportbridge.io / demo1234)
- [x] Demo data: 2 clients (Acme Digital, Bloom Retail) + 2 complete reports for demo user
- [x] Landing page: Hero with animated demo, changelog, README dark container, FAQ
- [x] Auth pages: Login + Signup with browser chrome frame
- [x] 3-panel workspace: Left sidebar (nav), Center (Outlet), Right inspector
- [x] App Dashboard: Stats cards + reports table
- [x] Client management: CRUD with modal
- [x] New Report wizard: Step 1 (create) → Step 2 (CSV upload) → Step 3 (proceed to map)
- [x] CSV Upload: Multi-file, pandas parsing, header detection
- [x] Column Mapping: Auto-detect, template application, save as template
- [x] Report Generation: KPI calculations (spend, leads, revenue, CPL, ROAS)
- [x] Report Preview: KPI cards + Recharts (Line + Bar) + Data table + Editable summary
- [x] PDF Export: window.print() with @media print CSS
- [x] Templates: List, apply, delete
- [x] First-time user onboarding demo: signup seeds demo client+report, redirects to preview
- [x] Demo banner: amber info bar on demo reports with "Create Real Report" CTA
- [x] React Error Boundary: wraps entire app, shows graceful crash screen
- [x] NaN/Infinity protection in KPI fmt() display function
- [x] ObjectId validation: all routes return 400 (not 500) on invalid ID format
- [x] Server-side password validation: min 6 chars enforced in backend
- [x] Client-side CSV validation: file type (.csv) + size (15 MB) + empty check before upload
- [x] Column mapping warning: warns when CSV headers don't match marketing column keywords
- [x] Empty state for charts: shown when report has no chart_data
- [x] Data table row cap: 50 rows visible, "Show all X rows" toggle
- [x] Session expired toast on 401 errors in report preview

## User Personas
- Freelance marketers and small agency owners
- Need to turn raw CSV exports (Google Ads, Meta, HubSpot) into client-ready reports

## Core Flow
1. Sign up / Log in
2. New user → auto-seeded demo client + 30-day report → redirected to demo preview
3. Add real client
4. Create report (name + client)
5. Upload 1-3 CSV files
6. Map columns to fields (date, spend, leads, revenue)
7. Generate report (KPIs calculated automatically)
8. Edit summary + Export PDF

## Page Routes
- `/` - Landing page
- `/login` - Login (browser frame)
- `/signup` - Signup (browser frame)
- `/app` - Dashboard (protected)
- `/app/clients` - Client management
- `/app/reports/new` - New report wizard
- `/app/reports/:id/map` - Column mapping
- `/app/reports/:id/preview` - Report preview + PDF export
- `/app/templates` - Template management

## P0 Backlog (Next Priority)
- [ ] Dark mode toggle
- [ ] Report list page (filterable by client)
- [ ] CSV sample download for testing

## P1 Backlog
- [x] CSV sample download: 3 templates on upload step (Standard, Google Ads, Meta/Facebook) — client-side generation, no backend needed
- [ ] User profile/settings page
- [ ] Team collaboration (invite members)
- [ ] White-label PDF header (agency logo)
- [ ] Scheduled report emails (Resend integration)
- [ ] Advanced chart types (pie, scatter)
- [ ] Multi-period comparison (MoM, QoQ)

## P2 Backlog
- [ ] Billing/subscription UI (Stripe)
- [ ] API key for report export endpoint
- [ ] Webhook notifications
- [ ] Google Sheets import
- [ ] Rate limiting on auth endpoints (brute-force protection)
