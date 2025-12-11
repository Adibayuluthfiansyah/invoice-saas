# ⚡ Invoice SaaS

A modern, full-stack Invoice Management Software as a Service (SaaS) application built to help freelancers and small businesses generate, track, and manage invoices seamlessly.

## 🚀 Features

This project showcases a complete production-ready architecture including authentication, database management, and payment processing.

* **🔐 Secure Authentication**: Robust user authentication flow (Login, Register, Forgot Password) using Supabase.
* **📊 Interactive Dashboard**: Overview of recent invoices, customer stats, and revenue charts.
* **🧾 Invoice Management**: Create, edit, and delete invoices with dynamic line items.
* **📄 PDF Generation**: Auto-generate professional PDF invoices for clients.
* **📧 Email Integration**: Send invoices directly to clients via email integration.
* **💳 Payment Gateway**: Integrated **Midtrans** payment gateway for real-time invoice payments.
* **👥 Customer Management**: CRM-lite features to manage client details.
* **⏰ Automated Reminders**: Cron jobs set up for payment reminders.
* **🎨 Responsive Design**: Built with Tailwind CSS and Shadcn UI for a beautiful mobile-first experience.

## 🛠️ Tech Stack

**Frontend:**
* [Next.js 15](https://nextjs.org/) (App Router)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Shadcn UI](https://ui.shadcn.com/) (UI Components)

**Backend & Database:**
* [Supabase](https://supabase.com/) (Auth & Database)
* [Prisma ORM](https://www.prisma.io/)
* [PostgreSQL](https://www.postgresql.org/)

**Services & Tools:**
* [Midtrans](https://midtrans.com/) (Payment Gateway)
* [Docker](https://www.docker.com/) (Containerization)
* [Zod](https://zod.dev/) (Schema Validation)

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

* Node.js (v18 or higher)
* npm or pnpm
* Docker (Optional, if running via Docker)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/adibayuluthfiansyah/invoice-saas.git](https://github.com/adibayuluthfiansyah/invoice-saas.git)
    cd invoice-saas
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and configure the following variables (based on `lib/utils.ts` and `prisma/schema.prisma`):

    ```env
    # Database (Supabase/Postgres)
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

    # Auth (Supabase)
    NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

    # Payments (Midtrans)
    MIDTRANS_SERVER_KEY="your-midtrans-server-key"
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
    
    # App URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Database Setup**
    Push the Prisma schema to your database:
    ```bash
    npx prisma db push
    # or
    npx prisma migrate dev
    ```

    *(Optional) Seed the database:*
    ```bash
    npx prisma db seed
    ```

5.  **Run the application**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🐳 Docker Support

To run the application using Docker:

```bash
docker-compose up -d --build

PROJECT STRUCTURE

🤝 Contributing

Contributions, issues, and feature requests are welcome!