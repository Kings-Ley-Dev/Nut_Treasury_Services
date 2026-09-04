# 🌰 Nut Treasury Services - Full-Stack MERN Website

> **Small seeds, mighty growth.**
> A complete MERN (MongoDB · Express · React · Node) banking website for **Nut Treasury Services**, a production-ready full-stack application.

---

## What's inside

A modern, responsive marketing + customer site with a working backend:

- **Home** - full-screen **video hero**, live rates ticker, services, "our purpose" split, *why us*, an interactive **loan repayment (EMI) calculator**, "banking for everyone", a **testimonials carousel** (with prev/next arrows) and CTAs.
- **About** - story, mission & vision, impact stats, values, a 15-year **timeline** and leadership.
- **Services** - full product catalogue (savings & CDs, micro/small-business/credit-builder/lending-circle loans, digital banking, money transfer, financial coaching).
- **Apply** - real, validated **account-opening** and **loan** application forms that save to MongoDB, with live EMI preview and a success screen + reference number.
- **Contact** - contact channels, working message form, opening hours and an accordion **FAQ**.
- **Auth** - register / login with JWT, plus a customer **Dashboard** that lists the user's applications and statuses.
- **Three role-based portals & dashboards:**
  - **Customer** (`/dashboard`) - account overview & balances, transaction history, transfers, **deposit & withdrawal requests**, beneficiaries, card management (issue/freeze virtual & physical cards), loan applications & repayment, downloadable statements (CSV), notifications, a security center, and KYC submission.
  - **Employee** (`/employee`) - customer support tickets, loan review & approvals, and customer lookup. Access is **invite-only** (an admin generates the link).
  - **Admin** (`/admin`) - user management (approve / reject / suspend / delete customers and employees), KYC verification & account approvals, transaction monitoring, fraud alerts, full loan management (approve → disburse), support tickets, employee invites, audit logs, and reports.
- **Hidden staff entry points:** the admin portal (`/portal/admin`) and employee portal (`/portal/employee`) are **not linked anywhere on the public site**. Admins self-register with a one-time setup code (no seeding required); employees can only sign up through an admin-issued invite link.
- **Deposit & withdrawal workflow:** customers *request* a deposit; a staff member (admin or employee) sends the bank account details to the customer (as a dashboard notification, and by email if SMTP is configured); the customer pays externally and marks it complete; staff confirm receipt, which credits the account. Withdrawals are requested by the customer and must be **approved by an admin or employee** before funds are released. Set `SMTP_*` in `server/.env` to enable the email channel (optional — dashboard notifications always work).
- **Full loan lifecycle:** apply → automatic risk assessment (score + Low/Medium/High band) → employee/admin approval → admin disbursement (credits the account and builds a monthly repayment schedule) → in-dashboard repayment.
- **Legal pages:** dedicated Privacy, Terms and Security pages linked from the footer.

### Design
- New brand theme derived from the logo: **royal blue `#15499C`** + **amber `#FF7E00`**, with an **emerald "growth" accent `#16A37A`**.
- Typography: **Sora** (display) + **Plus Jakarta Sans** (body).
- Fully responsive, accessible (keyboard focus, reduced-motion support), with subtle scroll-reveal and micro-interactions.
- The top utility bar and the old Blog page have been **removed**, as requested.

---

## Project structure

```
nut-microfinance-bank/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # axios instance (token interceptor)
│   │   ├── assets/         # logo + white logo
│   │   ├── Components/     # Navbar, Footer, common (Icons, PageHero, …)
│   │   ├── context/        # AuthContext, Toast
│   │   ├── data/           # content.js (all site copy in one place)
│   │   ├── Layout/         # RootLayout
│   │   ├── Pages/          # Home, About, Services, Apply, Contact, Login, Register, Dashboard, NotFound
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css       # design system / tokens
│   └── vite.config.js      # dev proxy → http://localhost:5000
│
├── server/                 # Express + MongoDB API
│   ├── config/db.js
│   ├── controllers/        # auth, account, loan, contact
│   ├── middleware/         # auth (JWT), optionalAuth, error handling
│   ├── models/             # User, AccountApplication, LoanApplication, ContactMessage, Newsletter
│   ├── routes/
│   ├── utils/              # helpers (JWT, EMI, validation), seed.js
│   └── server.js
│
└── package.json            # root scripts (run client + server together)
```

---

## Getting started

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** - either a local install (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Install everything
From the project root:

```bash
npm run install:all
```

This installs the root, server and client dependencies.

### 2. Configure environment variables

Ready-to-run **`.env`** files are already included for both `server/` and `client/` (alongside the `.env.example` templates), so the app runs out of the box in development. Edit `server/.env` to set your own `MONGO_URI`, a strong `JWT_SECRET`, and the `ADMIN_SIGNUP_CODE` used to create the first admin.

Key server variables:
- `ADMIN_SIGNUP_CODE` - one-time code required to self-register the first admin at `/portal/admin` (default `nut-admin-setup-2024`).
- `FRAUD_THRESHOLD` - transactions at or above this USD amount are flagged for review (default `10000`).

### 3. First admin & employees (no seeding needed)

1. Start the app, then visit **`/portal/admin`**, choose **Create admin**, and enter the `ADMIN_SIGNUP_CODE`. You're now the administrator.
2. From the admin dashboard's **Employee invites** tab, invite an employee by email. Copy the generated link (it points to `/portal/employee?token=…`) and share it with them.
3. The employee opens that link, sets a password, and lands in the **employee console**.

Customers simply register at `/register`; their accounts start **pending** until an admin approves them (or verifies KYC), which activates their bank account.

> A legacy `npm run seed` still exists to create an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, but the self-service admin portal is the recommended path.

### 4. Run in development
```bash
npm run dev
```
- API → http://localhost:5000
- Web → http://localhost:5173

Or run them separately: `npm run server` and `npm run client`.

### 5. Production build (frontend)
```bash
npm run build      # outputs client/dist
```

---

## API reference

Base URL: `/api`

| Method | Endpoint                  | Auth     | Purpose                                  |
|-------:|---------------------------|----------|------------------------------------------|
| GET    | `/health`                 | –        | Service health check                     |
| POST   | `/auth/register`          | –        | Create a customer account                |
| POST   | `/auth/login`             | –        | Sign in, returns JWT                     |
| GET    | `/auth/me`                | customer | Current user                             |
| POST   | `/accounts`               | optional | Submit an account-opening application    |
| GET    | `/accounts/mine`          | customer | List my account applications            |
| GET    | `/accounts`               | admin    | List all account applications            |
| PATCH  | `/accounts/:id/status`    | admin    | Update application status                |
| POST   | `/loans/calculate`        | –        | EMI calculation (no save)                |
| POST   | `/loans`                  | optional | Submit a loan application                |
| GET    | `/loans/mine`             | customer | List my loan applications               |
| GET    | `/loans`                  | admin    | List all loan applications               |
| PATCH  | `/loans/:id/status`       | admin    | Update loan status                       |
| POST   | `/contact`                | –        | Send a contact message                   |
| GET    | `/contact`                | admin    | List contact messages                    |
| PATCH  | `/contact/:id/handled`    | admin    | Mark a message handled / unhandled       |
| POST   | `/newsletter`             | –        | Subscribe an email                       |

**Auth header:** `Authorization: Bearer <token>`

---

## Tech stack
React 18 · React Router 6 · Vite 6 · Axios · Express 4 · Mongoose 8 · JWT · bcrypt · Helmet.

---

© Nut Treasury Services. Built as a full-stack MERN project.
