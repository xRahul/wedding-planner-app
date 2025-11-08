# Indian Wedding Planning Application - Setup & Implementation Guide

## Project Structure

```
wedding-planner-app/
├── app/                          # Next.js app directory
│   ├── api/
│   │   ├── events/              # Event CRUD endpoints
│   │   ├── foods/               # Food menu endpoints
│   │   ├── staff/               # Staff management endpoints
│   │   ├── guests/              # Guest & schedule endpoints
│   │   ├── gifts/               # Gift tracking endpoints
│   │   └── sangeet/             # Sangeet items endpoints
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/Dashboard
│   └── (routes)/
│       ├── events/              # Events planning page
│       ├── food-menu/           # Food menu page
│       ├── staff/               # Staff management page
│       ├── guests/              # Guest management page
│       ├── gifts/               # Gift tracking page
│       ├── sangeet/             # Sangeet planning page
│       └── timeline/            # Timeline view page
├── components/
│   ├── Navigation.tsx           # Main navigation component
│   ├── Sidebar.tsx              # Sidebar navigation
│   ├── events/                  # Event components
│   ├── food/                    # Food menu components
│   ├── staff/                   # Staff components
│   ├── guests/                  # Guest components
│   ├── gifts/                   # Gift components
│   ├── sangeet/                 # Sangeet components
│   └── common/                  # Common UI components
├── lib/
│   ├── db.ts                    # Database client setup
│   ├── api-client.ts            # API client utilities
│   └── types.ts                 # TypeScript types/interfaces
├── styles/
│   ├── globals.css              # Global styles
│   └── components.css           # Component styles
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Sample data
├── public/
│   └── images/                  # Image assets
├── .env.local                   # Local environment variables
├── next.config.js               # Next.js configuration
├── package.json
├── tsconfig.json
└── vercel.json                  # Vercel configuration
```

## Step 1: Initialize Project

### Commands
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest wedding-planner --typescript --tailwind --eslint

cd wedding-planner

# Install dependencies
npm install @prisma/client @vercel/postgres
npm install -D prisma tsx
```

### File: .env.local
```env
# Database
POSTGRES_PRISMA_URL=your_vercel_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_vercel_postgres_non_pooling_url

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 2: Database Schema Setup

### File: prisma/schema.prisma
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Wedding {
  id        String   @id @default(cuid())
  brideFirstName String
  brideLastName  String
  groomFirstName String
  groomLastName  String
  weddingDate    DateTime
  venue          String
  city           String
  budget         Decimal?
  currency       String @default("INR")
  
  // Relations
  events         Event[]
  foodMenus      FoodMenu[]
  staff          Staff[]
  guests         Guest[]
  gifts          Gift[]
  sangeetItems   SangeetItem[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Event {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  name           String   // Mehendi, Sangeet, Haldi, etc.
  date           DateTime
  startTime      String
  endTime        String
  venue          String
  description    String?
  theme          String?
  budget         Decimal?
  
  // Groom/Bride entry details
  brideEntry     Boolean @default(false)
  brideEntryTime String?
  brideEntryDescription String?
  groomEntry     Boolean @default(false)
  groomEntryTime String?
  groomEntryDescription String?
  
  staffAssignments Staff[]
  guestSchedules   GuestSchedule[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
}

model FoodMenu {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  eventId        String?
  event          Event?   @relation(fields: [eventId], references: [id])
  
  name           String   // Dish name
  category       String   // Vegetarian, Non-Veg, Dessert, Beverage
  description    String?
  servingSize    String?
  cost           Decimal?
  quantity       Int @default(0)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
}

model Staff {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  name           String
  role           String   // Caterer, Decorator, Photographer, etc.
  contact        String
  email          String?
  cost           Decimal?
  company        String?
  
  assignedEvents Event[]
  notes          String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
}

model Guest {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  firstName      String
  lastName       String
  relationship   String   // Family, Friend, Colleague
  contact        String?
  email          String?
  dietaryRequirements String?
  
  schedules      GuestSchedule[]
  gifts          Gift[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
}

model GuestSchedule {
  id             String   @id @default(cuid())
  guestId        String
  guest          Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  eventId        String
  event          Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  attending      Boolean @default(false)
  mealPreference String?
  specialRequirements String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([guestId, eventId])
  @@index([guestId])
  @@index([eventId])
}

model Gift {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  guestId        String
  guest          Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  
  description    String
  value          Decimal?
  received       Boolean @default(false)
  receivedDate   DateTime?
  thankyouSent   Boolean @default(false)
  notes          String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
  @@index([guestId])
}

model SangeetItem {
  id             String   @id @default(cuid())
  weddingId      String
  wedding        Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  songName       String
  singer         String   // Solo, Group
  performers     String[] // Array of performer names
  duration       String   // Format: MM:SS
  choreographyNotes String?
  costumes       String?
  musicFile      String?  // URL to music file
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([weddingId])
}
```

## Step 3: Database Setup Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Vercel PostgreSQL
npx prisma db push

# Create seed data (optional)
npx prisma db seed
```

## Step 4: Vercel Deployment Configuration

### File: vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Link existing project
vercel link
```

## Environment Variables on Vercel
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `POSTGRES_PRISMA_URL` - Your Vercel PostgreSQL connection string
   - `POSTGRES_URL_NON_POOLING` - Non-pooling connection URL
   - `NEXT_PUBLIC_API_URL` - Your deployed app URL

---

# CORE CODE FILES

## lib/types.ts
```typescript
// lib/types.ts
export interface Wedding {
  id: string;
  brideFirstName: string;
  brideLastName: string;
  groomFirstName: string;
  groomLastName: string;
  weddingDate: Date;
  venue: string;
  city: string;
  budget?: number;
  currency: string;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  theme?: string;
  brideEntry: boolean;
  brideEntryTime?: string;
  groomEntry: boolean;
  groomEntryTime?: string;
  description?: string;
}

export interface FoodMenu {
  id: string;
  name: string;
  category: string;
  cost?: number;
  quantity: number;
  servingSize?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  email?: string;
  cost?: number;
  company?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  contact?: string;
  email?: string;
  dietaryRequirements?: string;
}

export interface Gift {
  id: string;
  description: string;
  value?: number;
  received: boolean;
  thankyouSent: boolean;
  guestId: string;
}

export interface SangeetItem {
  id: string;
  songName: string;
  singer: string;
  performers: string[];
  duration: string;
  choreographyNotes?: string;
}
```

## lib/db.ts
```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## lib/api-client.ts
```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Events
  events: {
    list: (weddingId: string) =>
      apiCall(`/events?weddingId=${weddingId}`),
    create: (weddingId: string, data: any) =>
      apiCall(`/events`, "POST", { ...data, weddingId }),
    update: (id: string, data: any) =>
      apiCall(`/events/${id}`, "PUT", data),
    delete: (id: string) => apiCall(`/events/${id}`, "DELETE"),
  },
  
  // Similar patterns for other resources...
};
```

---

# AI PROMPTS FOR CODING AGENT

These prompts are designed to be given to an AI coding agent (like Claude, ChatGPT, or Cursor) to implement features step-by-step.

---

## STEP 1: API ENDPOINTS - Events Management

**Prompt:**
```
Create API endpoints for Event Management in Next.js with TypeScript and Prisma.

Requirements:
- Create file: app/api/events/route.ts
- Implement GET endpoint to list all events for a wedding (filter by weddingId query param)
- Implement POST endpoint to create a new event
- Implement PUT endpoint to update an event (route.ts in [id] folder)
- Implement DELETE endpoint to delete an event

Each endpoint should:
- Have proper TypeScript types
- Include error handling with try-catch
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)
- Include input validation using Zod or manual checks
- Use Prisma client from lib/db.ts

Event model fields: id, weddingId, name, date, startTime, endTime, venue, theme, description, budget, brideEntry, brideEntryTime, brideEntryDescription, groomEntry, groomEntryTime, groomEntryDescription

Use the Prisma schema provided in the project documentation.
```

---

## STEP 2: API ENDPOINTS - Food Menu Management

**Prompt:**
```
Create API endpoints for Food Menu Management in Next.js with TypeScript and Prisma.

Requirements:
- Create file: app/api/foods/route.ts
- Implement GET endpoint to list all food items (filter by weddingId, optional eventId)
- Implement POST endpoint to create a new food menu item
- Implement PUT endpoint to update food menu item
- Implement DELETE endpoint to delete food menu item

Food model includes: id, weddingId, eventId (optional), name, category (Vegetarian/Non-Veg/Dessert/Beverage), description, servingSize, cost, quantity

Include:
- Proper validation
- Error handling
- Calculate total food cost in GET response
- Support bulk operations (add/update multiple items at once)
```

---

## STEP 3: API ENDPOINTS - Guest & Guest Schedule Management

**Prompt:**
```
Create API endpoints for Guest Management and Guest Schedules in Next.js with TypeScript and Prisma.

Requirements:
- Create files: app/api/guests/route.ts and app/api/guests/[id]/schedules/route.ts
- Guests endpoint: GET (list by weddingId), POST (create), PUT (update), DELETE (delete)
- Guest Schedule endpoint: GET (schedules for a guest), POST (add to event), PUT (update attendance), DELETE (remove from event)

Guest fields: id, weddingId, firstName, lastName, relationship, contact, email, dietaryRequirements
GuestSchedule fields: id, guestId, eventId, attending, mealPreference, specialRequirements

Include:
- Unique constraint check (guest can't be added to same event twice)
- Validate dietary requirements
- Return guest list with their attendance status for each event
- Support for bulk guest import (CSV format)
```

---

## STEP 4: API ENDPOINTS - Staff Management

**Prompt:**
```
Create API endpoints for Staff Management in Next.js with TypeScript and Prisma.

Requirements:
- Create file: app/api/staff/route.ts
- Implement GET (list by weddingId), POST (create), PUT (update), DELETE (delete)

Staff model: id, weddingId, name, role (Caterer/Decorator/Photographer/etc), contact, email, company, cost, notes, assignedEvents (relation)

Include:
- Validate role from predefined list
- Calculate total staff budget
- Support assigning staff to multiple events
- Return staff details with assigned events
- Phone number validation
```

---

## STEP 5: API ENDPOINTS - Gift Tracking

**Prompt:**
```
Create API endpoints for Gift Tracking in Next.js with TypeScript and Prisma.

Requirements:
- Create file: app/api/gifts/route.ts
- Implement GET (list by weddingId, with filters: received/pending), POST (create), PUT (update), DELETE (delete)

Gift model: id, weddingId, guestId, description, value, received, receivedDate, thankyouSent, notes

Include:
- Calculate total gift value
- Filter by received/pending status
- Mark gift as received with timestamp
- Mark thank you note as sent
- Return guest details with gift information
- Support bulk update (mark multiple as received)
```

---

## STEP 6: API ENDPOINTS - Sangeet Items

**Prompt:**
```
Create API endpoints for Sangeet/Dance Items Management in Next.js with TypeScript and Prisma.

Requirements:
- Create file: app/api/sangeet/route.ts
- Implement GET (list by weddingId), POST (create), PUT (update), DELETE (delete)

SangeetItem model: id, weddingId, songName, singer, performers (array of strings), duration, choreographyNotes, costumes, musicFile (URL)

Include:
- Validate duration format (MM:SS)
- Store multiple performers in array
- Support adding music file URLs
- Calculate total Sangeet duration
- Validate performer count
```

---

## STEP 7: Create React Component - Events Dashboard

**Prompt:**
```
Create a React component for Events Dashboard in app/(routes)/events/page.tsx

Requirements:
- Display list of all events for the wedding
- Show event details: name, date, time, venue, theme
- Show entry details: Bride entry time/description, Groom entry time/description
- Features:
  - Add new event button (opens modal)
  - Edit event (inline or modal)
  - Delete event with confirmation
  - Filter events by type (Mehendi, Sangeet, Haldi, Shaadi)
  - Timeline view (chronological order)

Component structure:
- EventList component (reusable)
- EventCard component showing event details
- EventModal for create/edit
- Use TailwindCSS for styling
- Include loading states and error handling
- Use SWR or React Query for data fetching
- Responsive design (mobile-friendly)

Show bride/groom entries prominently with icons/colors
```

---

## STEP 8: Create React Component - Food Menu Planning

**Prompt:**
```
Create a React component for Food Menu Planning in app/(routes)/food-menu/page.tsx

Requirements:
- Display food items grouped by category (Vegetarian, Non-Veg, Dessert, Beverage)
- Show: name, servingSize, quantity, cost per item, total cost
- Features:
  - Add food item (with category selection)
  - Edit quantity/cost
  - Delete item
  - Calculate total food budget
  - Export food list as PDF/CSV
  - View food breakdown by category (pie chart)

Component structure:
- FoodCategorySection component (for each category)
- FoodItemRow component
- AddFoodModal component
- BudgetSummary component (showing total, breakdown by category)
- Use TailwindCSS tables for display
- Responsive grid layout

Add estimated number of guests field to calculate per-guest cost
```

---

## STEP 9: Create React Component - Guest Management

**Prompt:**
```
Create a React component for Guest Management in app/(routes)/guests/page.tsx

Requirements:
- Display table of all guests with: name, relationship, contact, email, dietary requirements
- Show attendance status across all events (yes/no/maybe)
- Features:
  - Add guest (single)
  - Bulk add guests (CSV import)
  - Edit guest details
  - Delete guest
  - Assign to events (with attendance status)
  - Filter by relationship or attendance status
  - View total guest count

Component structure:
- GuestTable component (sortable columns)
- GuestRow component with action buttons
- AddGuestModal component
- CSVImportModal component (with validation)
- EventAssignmentModal component
- GuestFilter component

Include:
- Email validation
- Phone number formatting
- Dietary requirements icons/badges
- Attendance indicator badges
```

---

## STEP 10: Create React Component - Staff Planning

**Prompt:**
```
Create a React component for Staff Management in app/(routes)/staff/page.tsx

Requirements:
- Display table of all staff members: name, role, company, contact, assigned events, cost
- Features:
  - Add staff member
  - Edit details
  - Delete staff
  - Assign to events (select multiple)
  - View assigned events for each staff
  - Calculate total staff budget
  - Contact staff via email/phone links

Component structure:
- StaffTable component
- StaffRow component with action buttons
- AddStaffModal component
- EventAssignmentDropdown for staff
- BudgetSummary component showing total staff cost

Include:
- Role dropdown (Caterer, Decorator, Photographer, Florist, DJ, etc.)
- Phone number and email as clickable links
- Event assignment status (badge showing number of assigned events)
- Color-coded budget status (green/yellow/red based on budget)
```

---

## STEP 11: Create React Component - Gift Tracker

**Prompt:**
```
Create a React component for Gift Tracking in app/(routes)/gifts/page.tsx

Requirements:
- Display gift table: from (guest name), description, value, received status, thank you sent status
- Features:
  - Mark gift as received (with date)
  - Mark thank you note as sent
  - Add notes to gift
  - Filter: received, pending, all
  - Sort by value, date received
  - Calculate total gift value
  - Export gift list

Component structure:
- GiftTable component
- GiftRow component with action buttons
- GiftModal for adding/editing
- ReceivedDatePicker for marking received
- GiftFilter and GiftSort components
- GiftSummary showing total value and statistics

Include:
- Status badges (Received, Pending, Thank You Sent)
- Value display in INR
- Guest details link/click
- Bulk mark operations (mark multiple received at once)
- Print-friendly gift list
```

---

## STEP 12: Create React Component - Sangeet Planning

**Prompt:**
```
Create a React component for Sangeet/Dance Planning in app/(routes)/sangeet/page.tsx

Requirements:
- Display list of Sangeet items: song name, singers, performers, duration, choreography notes
- Features:
  - Add Sangeet item
  - Edit details
  - Delete item
  - Show performer list with roles
  - Show choreography notes
  - Add music file URL
  - Show costumes info
  - Calculate total Sangeet duration

Component structure:
- SangeetItemCard component (card-based display, not table)
- SangeetModal for create/edit
- PerformerList component showing performers
- ChoreographyNotes component
- MusicFileUpload/URL input
- TotalDurationDisplay component

Include:
- Performer count badge
- Duration format (MM:SS)
- Music file link
- Edit performers inline
- Color-coded by singer type (Solo/Group)
- Timeline showing order of performances
```

---

## STEP 13: Create React Component - Timeline View

**Prompt:**
```
Create a React component for Wedding Timeline View in app/(routes)/timeline/page.tsx

Requirements:
- Display complete wedding timeline with all events in chronological order
- Show event details: name, date, time, venue, theme, entry details
- Include all event information on timeline

Display elements:
- Vertical timeline (responsive)
- Event cards on timeline showing:
  - Event name, date, time
  - Venue
  - Theme (if available)
  - Bride entry time/description (if applicable)
  - Groom entry time/description (if applicable)
  - Number of attendees
  - Staff assigned count
  - Food items for event
  
Features:
- Color-coded by event type (Mehendi, Sangeet, Haldi, Shaadi, etc.)
- Click to expand event details
- Show current/upcoming event highlight
- Print timeline functionality
- Share timeline feature
- Days until wedding countdown

Component structure:
- TimelineContainer component
- TimelineEvent component (expandable)
- EventDetails component
- CurrentEventHighlight component
- TimelineFilters (optional - show/hide event types)

Use a library like react-vertical-timeline-component or create custom CSS for timeline
```

---

## STEP 14: Create Layout & Navigation Components

**Prompt:**
```
Create Navigation and Layout components for the wedding planning app.

Requirements:

File: components/Navigation.tsx
- Top navigation bar showing:
  - App logo/name
  - Wedding couple names and date
  - Days until wedding countdown
  - Total budget and spent amount
  - User menu (settings, logout)

File: components/Sidebar.tsx
- Left sidebar with main navigation links:
  - Dashboard
  - Events
  - Food Menu
  - Guests
  - Staff
  - Gifts
  - Sangeet
  - Timeline
- Icons for each section
- Active link highlighting
- Collapsible on mobile

File: app/layout.tsx
- Main layout wrapper
- Include Navigation and Sidebar
- Main content area
- TailwindCSS responsive design
- Dark/Light mode toggle

Styling:
- Use TailwindCSS
- Professional wedding theme colors (gold, maroon, white)
- Responsive mobile/tablet/desktop
- Clean, minimal design
```

---

## STEP 15: Create Dashboard/Home Page

**Prompt:**
```
Create Dashboard in app/page.tsx showing wedding overview.

Requirements:
- Display wedding couple information with edit option
- Show wedding countdown timer
- Key statistics:
  - Total guests count
  - Total budget vs spent
  - Events count (upcoming first)
  - Staff count
  - Total gifts tracked
  - Sangeet items count

- Quick action buttons:
  - Add event
  - Add guest
  - View timeline
  - View budget summary

- Upcoming events widget (next 3 events)
- Recent activities feed
- Budget breakdown chart (pie chart showing category breakdown)
- Guest RSVP summary

Component structure:
- DashboardStats component
- UpcomingEventsWidget component
- BudgetChart component
- GuestSummary component
- QuickActions component

Include:
- Loading states
- Error handling
- Responsive layout
- Mobile-optimized cards
```

---

## Implementation Order for Coding Agent

1. **Start with database**: schema.prisma setup
2. **Then API endpoints**: events → foods → guests → staff → gifts → sangeet
3. **Then components**: Dashboard → Events → FoodMenu → Guests → Staff → Gifts → Sangeet → Timeline
4. **Finally**: Navigation, Layout, and polish
5. **Deploy to Vercel**

Each step can be worked on independently after the database schema is set up.

---

## Tips for Using These Prompts

1. **Sequential Execution**: Execute prompts in the given order
2. **Provide Context**: Share lib/types.ts and prisma/schema.prisma in each prompt
3. **Refinement**: Ask for adjustments to styling, functionality after initial implementation
4. **Testing**: Ask AI to include test cases for API endpoints
5. **Documentation**: Request TypeScript interfaces and component prop documentation
6. **Error Handling**: Ask for comprehensive error messages and user feedback
7. **Performance**: Request optimization for large guest lists, event timelines
8. **Export Features**: Ask for PDF/CSV export implementations

---

## Quick Start

1. Run project initialization
2. Set up database schema
3. Use the 15 step-by-step prompts with your coding agent
4. Deploy to Vercel using provided configuration
5. Add environment variables to Vercel dashboard
6. Push to GitHub and redeploy

Good luck with your wedding planning app! 🎉
