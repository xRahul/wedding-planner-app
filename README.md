# North Indian Wedding Planner Web Application

A comprehensive, production-ready web application for planning and coordinating North Indian weddings. Built with Next.js, TypeScript, Neon PostgreSQL, and Stack Auth.

![Wedding Planner](./assets/home.png)

## Features

### Core Functionality
- **Wedding Management**: Create and manage multiple weddings with detailed information
- **Event Planning**: Plan multi-day events (Roka, Mehendi, Haldi, Sangeet, Baraat, Wedding, Reception)
- **Guest Management**: Complete guest list with RSVP tracking, dietary preferences, and accommodation needs
- **Vendor Management**: Track vendors, quotes, contracts, and payments
- **Budget Tracking**: Comprehensive budget management with categories, expenses, and reports
- **Menu Planning**: Design menus for each event with dietary filters and quantity calculations
- **Dance & Performances**: Coordinate dance performances, participants, and rehearsal schedules
- **Task Management**: Create tasks with dependencies, assignments, and checklists
- **Travel & Logistics**: Manage guest travel, accommodation, and transportation
- **File Management**: Upload and organize documents, contracts, and media files
- **Reports & Analytics**: Export data in CSV, Excel, and PDF formats

### Technical Features
- **Authentication**: Secure user authentication with Stack Auth
- **Multi-user Support**: Role-based access control (Owner, Coordinator, Family Member, Vendor)
- **Real-time Updates**: Live dashboard with key metrics and statistics
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark Mode**: Built-in dark mode support
- **Data Export**: Export guest lists, budgets, and reports in multiple formats

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Stack Auth
- **UI Components**: Custom components with Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **File Export**: xlsx, jspdf
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ (or Bun)
- A Neon PostgreSQL database
- Stack Auth account (for authentication)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd wedding-planner-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Create .env.local file
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Database - Get from Neon Console → Connection Details
DATABASE_URL=postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require

# Stack Auth - Get from Stack Auth Dashboard → Settings
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id_here
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key_here
STACK_SECRET_SERVER_KEY=your_secret_key_here
```

**Important**: 
- Never commit `.env.local` to version control (it's in `.gitignore`)
- For production, add these same variables in Vercel Dashboard → Settings → Environment Variables

### 4. Set Up Stack Auth

1. Sign up at [Stack Auth](https://stack-auth.com)
2. Create a new project
3. Copy your project ID, publishable key, and secret key to `.env.local`
4. Configure your Stack Auth project:
   - Set redirect URLs: `http://localhost:3000/handler/*`
   - Enable email/password authentication

### 5. Set Up Database

#### Option A: Using Neon Dashboard
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string to your `.env.local` file

#### Option B: Using Neon CLI
```bash
npm install -g neonctl
neonctl projects create
neonctl connection-string --project-id <your-project-id>
```

### 6. Initialize Database Schema

You have **three options** to set up your Neon database:

#### Option A: Using SQL Script (Recommended - Most Reliable)

1. Go to [Neon Console](https://console.neon.tech) → Your Project → **SQL Editor**
2. Open the file `scripts/init-database.sql` from this project
3. Copy the entire SQL script
4. Paste into Neon SQL Editor and click **"Run"**
5. Verify: You should see ~26 tables created

#### Option B: Using Drizzle Push (Quick for Development)

```bash
# Push schema to database
npm run db:push
```

#### Option C: Using Drizzle Migrations

```bash
# Generate migrations from schema
npm run db:generate

# Run migrations
npm run db:migrate
```

### 7. Verify Database Setup

```bash
# Verify all tables and enums are created
npm run db:verify
```

You should see:
```
✅ All 6 required ENUMs exist
✅ All 26 required tables exist
✅ Database verification PASSED
```

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- `weddings` - Main wedding records
- `wedding_events` - Individual events (Mehendi, Sangeet, etc.)
- `guests` - Guest list with RSVP tracking
- `vendors` - Vendor directory
- `budget_categories` & `budget_items` - Budget management
- `menus` & `menu_items` - Menu planning
- `dance_performances` - Dance coordination
- `tasks` - Task management
- `guest_travel_details` - Travel logistics
- `media_files` - File storage
- And many more...

See `lib/db/schema.ts` for the complete schema definition.

## Project Structure

```
wedding-planner-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── guests/             # Guest management
│   ├── vendors/            # Vendor management
│   ├── budget/             # Budget tracking
│   ├── tasks/              # Task management
│   └── ...                 # Other pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/                    # Utility functions
│   ├── db/                # Database schema and connection
│   ├── utils.ts           # Helper functions
│   └── api-helpers.ts     # API utilities
├── drizzle/               # Database migrations
├── drizzle.config.ts      # Drizzle configuration
├── stack.ts               # Stack Auth configuration
└── package.json
```

## API Routes

The application provides RESTful API endpoints:

- `GET/POST /api/weddings` - Wedding management
- `GET/POST /api/events` - Event management
- `GET/POST /api/guests` - Guest management
- `GET/POST /api/vendors` - Vendor management
- `GET/POST /api/budget` - Budget tracking
- `GET/POST /api/tasks` - Task management
- And more...

All API routes require authentication and verify user access to the wedding resource.

## Deployment

### Quick Start

For detailed step-by-step instructions, see **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide with screenshots and troubleshooting.

### Quick Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Set Up Neon Database**
   - Create project at [Neon Console](https://console.neon.tech)
   - Run `scripts/init-database.sql` in Neon SQL Editor
   - Copy connection string

3. **Set Up Stack Auth**
   - Create project at [Stack Auth](https://stack-auth.com)
   - Get Project ID, Publishable Key, and Secret Key
   - Configure redirect URLs

4. **Deploy to Vercel**
   - Import GitHub repository
   - Add environment variables (see below)
   - Deploy!

5. **Verify**
   - Test app at your Vercel URL
   - Verify database has 26 tables
   - Update Stack Auth redirect URLs

### Environment Variables for Production

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ Yes |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth project ID | ✅ Yes |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth publishable key | ✅ Yes |
| `STACK_SECRET_SERVER_KEY` | Stack Auth secret key | ✅ Yes |

**Important**: Add all variables for **Production**, **Preview**, and **Development** environments.

### Detailed Deployment Guide

For comprehensive deployment instructions with troubleshooting, see:
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete step-by-step guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Alternative deployment guide

## Database Migrations

### Generate Migrations

```bash
npm run db:generate
```

This creates migration files in the `drizzle/` directory based on your schema changes.

### Apply Migrations

For development:
```bash
npm run db:push
```

For production, use migrations:
```bash
npm run db:migrate
```

### View Database

Use Drizzle Studio to view and edit your database:
```bash
npm run db:studio
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

### Adding New Features

1. **Database Changes**: Update `lib/db/schema.ts` and run `npm run db:generate`
2. **API Routes**: Add new routes in `app/api/`
3. **Pages**: Add new pages in `app/`
4. **Components**: Add reusable components in `components/`

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct in `.env.local`
- Check that your Neon database is active
- Ensure your IP is whitelisted (if required)

### Authentication Issues

- Verify Stack Auth environment variables are set correctly
- Check that redirect URLs are configured in Stack Auth dashboard
- Ensure cookies are enabled in your browser

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [documentation](./docs)
- Open an issue on GitHub
- Contact support

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database powered by [Neon](https://neon.tech)
- Authentication by [Stack Auth](https://stack-auth.com)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)

---

**Note**: This is a comprehensive wedding planning application. Make sure to:
- Set up proper authentication
- Configure your database correctly
- Test all features before production use
- Keep your environment variables secure
- Regularly backup your database

