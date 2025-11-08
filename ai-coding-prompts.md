# AI Coding Agent Prompts - Complete Implementation Guide

## How to Use These Prompts

These prompts are designed to be used with AI coding agents like Claude, ChatGPT with Code Interpreter, or Cursor AI. Follow them sequentially for a complete, working wedding planning application.

**Instructions:**
1. Share the project structure and schema files first
2. Use one prompt at a time
3. Ask for refinements if needed
4. Move to the next prompt after implementation
5. Test locally before moving forward

---

# PHASE 1: PROJECT SETUP & DATABASE

## Prompt 1.1: Initialize Next.js Project with TypeScript

```
Create a Next.js project setup for an Indian wedding planning application.

Instructions:
1. Generate the exact npm commands needed to create a Next.js project with:
   - TypeScript support
   - TailwindCSS styling
   - ESLint configuration
   - App Router (not Pages Router)

2. List all npm packages to install:
   - @prisma/client
   - @vercel/postgres
   - react-icons (for icons)
   - date-fns (for date formatting)

3. Provide the exact file structure to create under /lib, /components, /app/api

4. Generate a comprehensive .gitignore file suitable for Next.js + Prisma

Show only the terminal commands and file structure - no code yet.
```

## Prompt 1.2: Environment Variables Setup

```
Create environment variable files for the wedding planning app.

Generate two files:

1. .env.local (for local development):
   - POSTGRES_PRISMA_URL (add placeholder comment)
   - POSTGRES_URL_NON_POOLING (add placeholder comment)
   - NEXT_PUBLIC_API_URL=http://localhost:3000
   - NODE_ENV=development

2. .env.example (template for GitHub):
   - Same variables as above but with empty values
   - Add comments explaining each variable
   - Add explanation of where to get Vercel PostgreSQL connection strings

Include instructions for setting up Vercel PostgreSQL connection strings.
```

## Prompt 1.3: Prisma Schema - Core Models

```
Create the complete Prisma schema for the wedding planning database.

Requirements:
- Database provider: PostgreSQL
- Use Vercel PostgreSQL environment variables
- Create 8 models: Wedding, Event, FoodMenu, Staff, Guest, GuestSchedule, Gift, SangeetItem

For each model include:
- All necessary fields with appropriate types
- Relationships (one-to-many, many-to-many)
- Default values where appropriate
- Indexes for performance on frequently queried fields
- Cascading deletes for data integrity

Wedding model: Couple names, dates, venue, city, budget
Event model: Type, dates, times, venue, theme, bride/groom entry details
FoodMenu model: Dish details, category, cost, quantity
Staff model: Role, contact, company, cost
Guest model: Personal details, dietary requirements
GuestSchedule model: RSVP, meal preferences, event attendance
Gift model: Giver, description, value, received status
SangeetItem model: Song details, performers, duration, choreography notes

Include proper indexing for weddingId on all models.
```

## Prompt 1.4: Database Client & Types

```
Create database utility files for the wedding planning app.

Create 2 files:

File 1: lib/db.ts
- Singleton pattern for Prisma client to prevent multiple instances
- Error logging configuration
- Production vs development settings
- Export default prisma instance

File 2: lib/types.ts
- Export TypeScript interfaces for all models
- Include optional fields marked with ?
- Create ApiResponse<T> generic type
- Include enums for categories, roles, relationships

All interfaces should match Prisma schema exactly.
Include JSDoc comments for complex types.
```

---

# PHASE 2: API ENDPOINTS

## Prompt 2.1: Events API Endpoints

```
Create complete API endpoints for event management.

Create files:
- app/api/events/route.ts
- app/api/events/[id]/route.ts

Requirements for app/api/events/route.ts:

GET endpoint:
- Query parameter: weddingId (required)
- Return all events for the wedding ordered by date
- Include count of guest schedules and food items
- Return proper error for missing weddingId

POST endpoint:
- Accept: weddingId, name, date, startTime, endTime, venue, theme, description, budget
- Also accept: brideEntry, brideEntryTime, brideEntryDescription
- Also accept: groomEntry, groomEntryTime, groomEntryDescription
- Validate all required fields
- Return 201 with created event on success
- Return 400 for validation errors

Requirements for app/api/events/[id]/route.ts:

PUT endpoint:
- Accept any event fields to update
- Return updated event with 200 status
- Return 404 if event not found

DELETE endpoint:
- Delete event by ID
- Return 200 with success message
- Return 404 if event not found

Include:
- Proper error handling with try-catch
- TypeScript types for request body
- HTTP status codes (200, 201, 400, 404, 500)
- Console logging for debugging
- Input validation using if statements or Zod
```

## Prompt 2.2: Food Menu API Endpoints

```
Create complete API endpoints for food menu management.

Create file: app/api/foods/route.ts

Requirements:

GET endpoint:
- Query parameters: weddingId (required), eventId (optional)
- Return all food items filtered by weddingId
- Additionally filter by eventId if provided
- Group food items by category in response
- Calculate and return total food cost
- Return foods ordered by category

POST endpoint:
- Accept: weddingId, eventId (optional), name, category, cuisine, description, servingSize, cost, quantity, ingredients, allergies
- Validate required fields: weddingId, name, category
- Create food menu item
- Return 201 on success
- Return 400 for validation errors

Grouping in response:
- Group by category: Vegetarian, Non-Veg, Dessert, Beverage
- Return grouped object in response
- Include count per category

Include:
- Error handling
- Type safety with TypeScript
- Cost calculation as Decimal
- Quantity management
```

## Prompt 2.3: Guest Management API Endpoints

```
Create complete API endpoints for guest management.

Create files:
- app/api/guests/route.ts
- app/api/guests/[id]/route.ts

Requirements for app/api/guests/route.ts:

GET endpoint:
- Query parameter: weddingId (required)
- Return all guests for wedding
- Include their event schedules and gifts
- Include total guest count in response
- Order by firstName

POST endpoint:
- Accept: weddingId, firstName, lastName, relationship, contact, email, dietaryRequirements, plusOne
- Validate required fields: weddingId, firstName, lastName, relationship
- Create guest
- Return 201 with created guest

Requirements for app/api/guests/[id]/route.ts:

PUT endpoint:
- Update guest details
- Return updated guest

DELETE endpoint:
- Delete guest and cascade delete their schedules and gifts
- Return success message

Include:
- Email validation
- Phone number format validation
- Dietary requirements validation
- Relationship validation against allowed values
```

## Prompt 2.4: Staff Management API Endpoints

```
Create complete API endpoints for staff management.

Create file: app/api/staff/route.ts

Requirements:

GET endpoint:
- Query parameter: weddingId (required)
- Return all staff members
- Group by role in response
- Calculate total staff budget
- Return staff count

Allowed roles: Caterer, Decorator, Photographer, DJ, Florist, Makeup Artist, Hair Stylist, Videographer, Coordinator, Security, Other

POST endpoint:
- Accept: weddingId, name, role, contact, email, cost, company, expertise, notes
- Validate required fields: weddingId, name, role, contact
- Validate role against allowed roles list
- Validate phone number format (10 digits for India)
- Create staff member
- Return 201

Staff model relations:
- Staff can be assigned to multiple events
- Store cost as Decimal
- Support expertise descriptions

Include:
- Cost calculation and budgeting
- Role validation
- Contact information validation
- Error responses
```

## Prompt 2.5: Gift Tracking API Endpoints

```
Create complete API endpoints for gift tracking.

Create file: app/api/gifts/route.ts

Requirements:

GET endpoint:
- Query parameters: weddingId (required), status (optional: "received", "pending", "all")
- Default status filter: "all"
- Return gifts with guest information
- Calculate statistics: totalValue, receivedCount, pendingCount, totalGifts
- Include gifts ordered by most recent first
- Only show gifts matching status filter

POST endpoint:
- Accept: weddingId, guestId, description, value, notes
- Validate required fields: weddingId, guestId, description
- Create gift entry
- Return 201 with gift and guest info

PUT endpoint for gift updates:
- Update: received status, receivedDate, thankyouSent, thankyouDate, notes
- Only allow updating existing gifts
- Return updated gift

Statistics calculations:
- Total gift value (sum of all gift values)
- Count of received gifts
- Count of pending gifts
- Average gift value
- Most expensive gift

Include:
- Value stored as Decimal
- Date tracking for received and thank you
- Automatic timestamp for created/updated
- Proper filtering logic
```

## Prompt 2.6: Sangeet API Endpoints

```
Create complete API endpoints for Sangeet/Dance management.

Create file: app/api/sangeet/route.ts

Requirements:

GET endpoint:
- Query parameter: weddingId (required)
- Return all Sangeet items
- Order by creation date (performance sequence)
- Include performer count with each item
- Return total items count

POST endpoint:
- Accept: weddingId, songName, artist, performers (array of strings), duration, choreographyNotes, costumes, musicFile, rehearsalNotes
- Validate required fields: weddingId, songName, duration
- Validate duration format: MM:SS (e.g., "03:45")
- Validate performers array (not empty)
- Create Sangeet item
- Return 201

Sangeet model:
- songName: String
- artist: String (Solo or Group name)
- performers: String[] (array of performer names)
- duration: String (MM:SS format)
- choreographyNotes: Text with choreography details
- costumes: String with costume details
- musicFile: URL to music file
- rehearsalNotes: Text with rehearsal information

Validations:
- Duration must be valid MM:SS format
- Performers array must have at least 1 name
- Music file must be valid URL if provided

Include:
- Error handling for format validation
- Array handling for performers
- Duration calculation helper (optional)
```

## Prompt 2.7: Guest Schedules API Endpoints

```
Create complete API endpoints for guest event schedules.

Create file: app/api/guests/[guestId]/schedules/route.ts

Requirements:

GET endpoint:
- Path parameter: guestId (required)
- Query parameter: weddingId (required)
- Return all events assigned to guest
- Include attendance status and meal preferences
- Show guest's attendance for all events

POST endpoint:
- Accept: guestId, eventId, attending, mealPreference, specialRequirements
- Validate: guestId exists, eventId exists, weddingId matches
- Check unique constraint (guest not already added to event)
- Create guest schedule
- Return 201

PUT endpoint:
- Update attendance status
- Update meal preference
- Update special requirements
- Set confirmation date when updating attendance
- Return updated schedule

DELETE endpoint:
- Remove guest from event
- Delete schedule record
- Return success

Validations:
- Each guest can only be added to each event once (unique constraint)
- Attending must be boolean
- Meal preference validation against dietary requirements
- Only allow status changes: yes, no, maybe, pending

Include:
- Unique constraint enforcement
- Guest and event existence validation
- Timestamp for confirmations
```

---

# PHASE 3: REACT COMPONENTS

## Prompt 3.1: Dashboard/Home Page

```
Create the main dashboard component showing wedding overview.

Create file: app/page.tsx

Requirements:

Components to include:

1. Wedding Info Section:
   - Display couple names: "Bride FirstName LastName & Groom FirstName LastName"
   - Display wedding date with countdown (Days until wedding)
   - Display venue and city
   - Button to edit wedding details

2. Quick Stats Section (Card Grid):
   - Total guests count
   - Total budget vs amount spent
   - Number of events
   - Staff members count
   - Total gifts tracked
   - Sangeet items count

3. Budget Overview Card:
   - Display total budget remaining
   - Show percentage of budget used
   - Display budget breakdown by category (Events, Food, Staff, Other)
   - Show overage if budget exceeded

4. Upcoming Events Widget:
   - Show next 3 upcoming events
   - Display event name, date, time, venue
   - Show "Days until event" for each
   - Link to full events page

5. Quick Action Buttons:
   - Add event button (links to events page)
   - Add guest button (links to guests page)
   - View timeline button
   - Export wedding details button

6. Guest Summary:
   - Total guests
   - RSVP status breakdown: Confirmed, Pending, Declined
   - Show as percentages

Styling:
- Use TailwindCSS
- Responsive grid layout (1 col mobile, 2-3 cols desktop)
- Card-based design with shadows
- Colors: Gold (#D4AF37), Maroon (#800000), White, Light gray backgrounds
- Professional wedding theme

Data fetching:
- Fetch all data from API on component mount
- Use React hooks (useState, useEffect)
- Show loading state
- Handle errors gracefully

Include:
- Countdown timer component
- Reusable StatCard component
- Budget calculation logic
- Responsive design
- No external date libraries (use native Date)
```

## Prompt 3.2: Events Planning Component

```
Create the Events planning page component.

Create file: app/(routes)/events/page.tsx

Requirements:

Main Layout:
- Header: "Wedding Events" with Add Event button
- Two view options: Timeline view (default) and List view
- Filter dropdown: Show all / By event type (Mehendi, Sangeet, Haldi, Shaadi, Other)

Timeline View:
- Vertical timeline showing events in chronological order
- Each event on timeline shows:
  - Event name with icon/color based on type
  - Date and time
  - Venue
  - Theme if available
  - Days from today

Event Card (both views):
- Event name (large, bold)
- Date and time
- Venue
- Theme (small badge)
- Number of attendees
- Number of staff assigned
- Bride entry details (if applicable): time, description
- Groom entry details (if applicable): time, description
- Budget if set
- Action buttons: Edit, Delete, View Details

Event Details Expandable Section:
- Show guest count
- Show staff assigned
- Show food items for event
- Show decorations/theme details

Add/Edit Event Modal:
- Form fields: name, date, time (start/end), venue, theme, description, budget
- Bride entry checkbox + time + description fields
- Groom entry checkbox + time + description fields
- Save and Cancel buttons
- Validation: all required fields must be filled

Features:
- Add new event
- Edit existing event
- Delete event (with confirmation)
- Filter by event type
- View timeline
- Color coding by event type
- Responsive design

Styling:
- Use TailwindCSS
- Timeline styling with vertical line
- Event cards with color indicators
- Modal with overlay
- Responsive on mobile

Include:
- API integration for CRUD operations
- Error handling
- Loading states
- Success notifications
- Delete confirmation dialog
```

## Prompt 3.3: Food Menu Planning Component

```
Create the Food Menu planning page component.

Create file: app/(routes)/food-menu/page.tsx

Requirements:

Main Layout:
- Header: "Food Menu Planning"
- Add Food Item button
- View options: Grid by category (default) or Table view
- Export as CSV button
- Export as PDF button

Category Sections (when grouped):
- Vegetarian
- Non-Vegetarian
- Desserts
- Beverages
- Each section shows items count and category total cost

Food Item Display (Card format):
- Dish name
- Category badge with color
- Cuisine type
- Serving size
- Quantity
- Cost per item
- Total cost (quantity × cost)
- Description/ingredients
- Allergies warning if present
- Edit button
- Delete button
- Increase/decrease quantity buttons (+/-)

Budget Summary Card:
- Total food budget
- Breakdown by category (pie chart or list)
- Per-guest cost estimate (if guest count known)
- Budget remaining

Add/Edit Food Item Modal:
- Fields: name, category dropdown, cuisine, description, serving size, cost, quantity, ingredients, allergies
- Validation: name, category, quantity are required
- Save and Cancel buttons

Features:
- Add new food item
- Edit food item (inline or modal)
- Delete food item (with confirmation)
- Group by category
- Calculate total costs
- Per-guest cost calculation
- Export to CSV (name, category, quantity, cost, total)
- Export to PDF with formatted table
- Category-wise breakdown

View Switching:
- Grid/Card view (default, responsive columns)
- Table view (for detailed information)

Styling:
- TailwindCSS
- Category color coding
- Responsive grid (1 col mobile, 2-3 cols tablet, 4 cols desktop)
- Professional food catering style
- Clear typography

Include:
- API integration
- Error handling
- Loading states
- Input validation
- Real-time cost calculations
```

## Prompt 3.4: Guest Management Component

```
Create the Guest Management page component.

Create file: app/(routes)/guests/page.tsx

Requirements:

Main Layout:
- Header: "Guest Management"
- Add Guest button (single) and Add Multiple Guests button (bulk CSV)
- Filter options: All / By relationship / By attendance status
- Search box for guest name
- Export as CSV button
- Total guest count display

Guest Table View:
- Columns: Name, Relationship, Contact, Email, Dietary Requirements, Events Attending, Status
- Sortable by name, relationship, events attending count
- Row actions: Edit, Delete, View Details, Assign to Events
- Responsive: Hide less important columns on mobile

Guest Row Display:
- Full name
- Relationship (Family, Friend, Colleague, etc.)
- Contact number (clickable tel: link)
- Email (clickable mailto: link)
- Dietary requirements with icons/badges
- Attendance status icons for key events
- Plus-one indicator if applicable

Guest Details Modal:
- Name, relationship, contact, email
- Dietary requirements
- Events assigned (with attendance status)
- Associated gifts
- Special requests/notes

Add Single Guest Modal:
- Fields: first name, last name, relationship dropdown, contact, email, dietary requirements, plus one checkbox
- Validations: first name, last name, relationship required
- Email and phone validation

Add Multiple Guests (CSV) Modal:
- File upload field
- CSV format: firstName, lastName, relationship, contact, email, dietary, plusOne
- Preview table before import
- Import button with validation
- Show errors for invalid rows

Assign to Events Modal:
- Show list of all events
- Checkboxes for each event
- Meal preference dropdown for each selected event
- Special requirements field
- Save assignments

Features:
- Add single guest
- Bulk add guests from CSV
- Edit guest details
- Delete guest
- Filter by relationship
- Filter by attendance status
- Search by name
- Assign to events
- View guest details
- Export guest list as CSV
- Link to contact info (phone/email)

Styling:
- TailwindCSS table styling
- Responsive data table
- Badges for dietary requirements
- Status indicators (green, yellow, red)
- Clean, organized layout

Include:
- API integration
- CSV import/export functionality
- Input validation
- Error handling
- Loading states
- Confirmation dialogs
```

## Prompt 3.5: Staff Planning Component

```
Create the Staff Management page component.

Create file: app/(routes)/staff/page.tsx

Requirements:

Main Layout:
- Header: "Staff & Vendors"
- Add Staff Member button
- Filter by role dropdown
- Sort options: name, cost, company
- Total staff count and total staff budget display

Staff Table View:
- Columns: Name, Role, Company, Contact, Email, Cost, Assigned Events, Actions
- Sortable columns
- Color-coded budget status (green safe, yellow approaching limit, red over budget)
- Responsive table (hide columns on mobile)

Staff Row Display:
- Member name
- Role with icon (Caterer, Photographer, DJ, etc.)
- Company name if available
- Contact: phone (clickable tel:) and email (clickable mailto:)
- Cost in INR
- Number of assigned events (badge)
- Status indicator
- Action buttons: Edit, Delete, Assign Events, View Details

Add/Edit Staff Modal:
- Fields: name, role dropdown, contact, email, company, cost, expertise, notes
- Roles: Caterer, Decorator, Photographer, DJ, Florist, Makeup Artist, Hair Stylist, Videographer, Event Coordinator, Security, Other
- Validations: name, role, contact required
- Phone validation (10 digits for India)
- Save and Cancel

Assign to Events Modal:
- Show all events as checkboxes
- Multi-select events
- Save assignments

Staff Details Modal:
- Show all staff information
- List of assigned events with dates
- Services provided
- Contact information
- Cost details

Features:
- Add staff member
- Edit staff details
- Delete staff member
- Assign to events (multiple events)
- View assigned events
- Filter by role
- Sort by cost, name, company
- Calculate total staff budget
- Budget tracking and warnings
- Contact information (clickable links)

Role Icons:
- Caterer: 🍳
- Photographer: 📷
- DJ: 🎵
- Florist: 🌸
- Makeup: 💄
- Hair: ✂️
- Videographer: 🎬
- Coordinator: 📋
- Security: 👮
- Other: ⚙️

Styling:
- TailwindCSS
- Role-based color coding
- Budget status indicators (color gradients)
- Professional business theme
- Responsive design
- Clear hierarchy

Include:
- API integration
- Input validation
- Error handling
- Loading states
- Confirmation dialogs
- Budget calculations
- Cost formatting in INR
```

## Prompt 3.6: Gift Tracking Component

```
Create the Gift Tracking page component.

Create file: app/(routes)/gifts/page.tsx

Requirements:

Main Layout:
- Header: "Gift Registry & Tracking"
- Add Gift button
- Filter tabs: All / Received / Pending
- Sort options: By value (high to low), By date received, By guest name
- Export as CSV button
- Print-friendly view option

Gift Statistics Card:
- Total gifts tracked
- Total gift value in INR
- Received count with percentage
- Pending count with percentage
- Average gift value
- Highest value gift

Gift Table View:
- Columns: From (Guest), Gift Description, Value (INR), Received Status, Thank You Status, Actions
- Sortable
- Responsive (hide less important columns on mobile)
- Status indicators (badges) for received and thank you

Gift Row Display:
- Guest name (linked to guest details)
- Gift description
- Value in INR
- Received status: "Received ✓" or "Pending ⏳"
- Date received (if received)
- Thank you sent status: "Thank You Sent ✓" or "Not Yet"
- Thank you date (if sent)
- Action buttons: Edit, Delete, Mark as Received, Mark Thank You Sent, View Details, Add Notes

Add/Edit Gift Modal:
- Fields: guest dropdown, description, value, notes
- Validations: guest, description required
- Optional value field (some gifts don't have monetary value)
- Save and Cancel

Mark Received Modal:
- Show gift details
- Date picker for received date (defaults to today)
- Optional: Mark thank you sent at same time
- Save button

Mark Thank You Modal:
- Show gift and giver details
- Date picker for thank you date (defaults to today)
- Optional notes (how/when thank you was sent)
- Save button

Gift Details Modal:
- Guest full details
- Gift description
- Value
- Received date and status
- Thank you sent date and status
- Additional notes
- Edit and Delete buttons

Features:
- Track gifts by recipient (guest)
- Record when gifts are received
- Track thank you notes sent
- Add notes/details to each gift
- Filter by status (received/pending)
- Sort by value, date, guest name
- Calculate statistics
- Export gift list as CSV
- Print view for records
- Mark received with date
- Mark thank you sent with date
- Bulk operations (mark multiple received)

Statistics Calculations:
- Total gifts count
- Total value (sum of values)
- Received percentage
- Average value
- Highest value gift
- Most recent received

Styling:
- TailwindCSS
- Status badges with colors (green for received, orange for pending)
- Value formatting in INR currency
- Professional financial report style
- Responsive tables
- Clean typography

Include:
- API integration
- Date picker for dates
- Currency formatting
- Input validation
- Error handling
- Loading states
- Confirmation dialogs
- CSV export functionality
- Print-friendly styles
```

## Prompt 3.7: Sangeet Planning Component

```
Create the Sangeet/Dance Planning page component.

Create file: app/(routes)/sangeet/page.tsx

Requirements:

Main Layout:
- Header: "Sangeet & Dance Performance"
- Add Performance button
- View as List or Performance Order (sequence)
- Total duration calculator
- Print rehearsal schedule button

Performance Card Display (default view):
- Song name (large, bold)
- Artist name or group type (Solo/Duet/Group)
- Performer list with names
- Duration (MM:SS)
- Performers count badge
- Choreography notes preview
- Costumes details if provided
- Music file link (if available)
- Action buttons: Edit, Delete, View Details, Move Up/Down (ordering)

Performance Order View:
- Vertical sequence list
- Performance number (1, 2, 3...)
- Song name with time
- Performers names
- Total show duration display at bottom
- Drag to reorder (optional)
- Buttons to move up/down in sequence

Add/Edit Performance Modal:
- Fields: song name, artist, performers (multiselect/tag input), duration, choreography notes, costumes, music file URL, rehearsal notes
- Validations: song name, duration required
- Duration format: MM:SS (e.g., "03:45")
- Performers: add multiple names with + button
- Save and Cancel

Performer Details:
- List of all performer names
- Each performer on separate line
- Edit performers with +/- buttons

Choreography Notes Section:
- Large text area
- Stores detailed choreography instructions
- For dancers to reference during rehearsal

Performance Details Modal:
- Show all performance information
- List of performers with roles if available
- Music file link (clickable)
- Choreography notes display
- Costume details
- Rehearsal notes
- Duration display
- Edit and Delete buttons

Features:
- Add Sangeet/dance performance
- Edit performance details
- Delete performance
- Add multiple performers to one song
- Store performers as array
- Reorder performances (performance sequence)
- Add choreography notes
- Add costume details
- Store music file URLs
- Calculate total Sangeet duration
- Track rehearsal notes
- Print rehearsal schedule
- Performer count tracking

Statistics:
- Total number of performances
- Total Sangeet duration
- Number of unique performers
- Number of solo vs group performances

Styling:
- TailwindCSS
- Card-based layout for performances
- Number badge for performance order
- Time display formatted
- Professional performance schedule style
- Responsive design (mobile-optimized for performers)
- Color coding by type (Solo=Blue, Group=Purple)

Include:
- API integration
- Multiselect for performers
- Duration validation (MM:SS format)
- Input validation
- Error handling
- Loading states
- Confirmation dialogs
- Array handling for performers
- Time duration calculations
- Reordering logic (optional: drag-and-drop)
```

## Prompt 3.8: Timeline View Component

```
Create the Wedding Timeline view component.

Create file: app/(routes)/timeline/page.tsx

Requirements:

Layout:
- Full-page timeline view
- Horizontal or vertical timeline (implement vertical for mobile responsiveness)
- Event cards positioned chronologically
- Scroll-friendly layout

Timeline Structure:
- Vertical line down the center (or left side)
- Events placed alternately left and right of timeline
- Color-coded by event type
- Connected to timeline with lines

Event Information on Timeline:
- Event name
- Date and day of week (e.g., "Saturday, Jan 15")
- Time (from-to)
- Venue
- Theme (if available)
- Number of days from today or "Today" label

Bride & Groom Entry Details:
- If bride enters: "👰 Bride Entry at [time]" with description
- If groom enters: "🤵 Groom Entry at [time]" with description
- Display prominently with color coding
- Bride entry: Pink/rose color background
- Groom entry: Blue color background

Event Expansion on Click:
- Expandable event cards
- Show additional details:
  - Full description
  - Number of guests attending
  - Staff members assigned
  - Food items for event
  - Budget allocated
  - Special instructions

Countdown Widget:
- Days until wedding (prominently displayed at top)
- Next upcoming event highlighted
- Time remaining to next event

Timeline Features:
- Color coding by event type:
  - Mehendi: Orange
  - Sangeet: Purple
  - Haldi: Yellow
  - Shaadi/Reception: Red/Gold
  - Other: Gray
- Icons for each event type
- Current/upcoming event highlighted with glow effect
- Past events shown in muted colors

Interactive Features:
- Click event to expand details
- Smooth scroll to event
- Print button for timeline
- Share timeline option
- Export as PDF
- Zoom in/out (optional)

Mobile Responsiveness:
- Stack timeline vertically
- Full-width cards
- Optimize for small screens
- Readable on portrait mode

Styling:
- TailwindCSS
- Event type color coding
- Vertical line styling (border, gradient)
- Card shadows and transitions
- Professional wedding invitation style
- Gold and maroon accents
- White and light backgrounds
- Clear typography hierarchy

Timeline Calculations:
- Order events by date (ascending)
- Calculate days from today
- Highlight current and upcoming events
- Show past events in history section (optional)

Export Features:
- Print timeline (formatted for paper)
- Export to PDF
- Share timeline (generate shareable link)

Include:
- API integration to fetch all events
- Responsive design
- Smooth scrolling
- Event details modal
- Loading states
- Error handling
- Date formatting (use date-fns or native Date)
- Color coding logic
- Countdown timer logic
```

## Prompt 3.9: Navigation & Layout Components

```
Create navigation and layout components for the wedding planning app.

Create 3 files:

FILE 1: components/Navigation.tsx
- Top navigation bar
- Show wedding couple names: "[Bride Name] & [Groom Name]"
- Show wedding date
- Show days until wedding countdown (bold)
- Right side: Budget summary (Total / Spent / Remaining)
- User menu (Settings, Logout)
- Mobile hamburger menu
- Responsive design

FILE 2: components/Sidebar.tsx
- Left sidebar with vertical navigation
- Navigation links:
  1. Dashboard (home icon)
  2. Events (calendar icon)
  3. Food Menu (utensils icon)
  4. Guests (people icon)
  5. Staff (briefcase icon)
  6. Gifts (gift icon)
  7. Sangeet (music icon)
  8. Timeline (timeline icon)
- Active link highlighting (bold, colored)
- Collapse/expand on mobile (hamburger menu)
- Logo or app name at top
- Professional styling

FILE 3: app/layout.tsx (Root Layout)
- Combine Navigation and Sidebar
- Main content area
- Responsive grid layout
- Dark/Light mode toggle (optional)
- Mobile: stack vertically, hamburger menu
- Desktop: sidebar + content
- Consistent spacing and padding
- Global styles

Layout Structure:
- Navigation at top (full width, fixed or sticky)
- Sidebar on left (fixed or sticky)
- Main content area takes remaining space
- Responsive breakpoints:
  - Mobile (< 768px): Full-width content, hamburger menu
  - Tablet (768px - 1024px): Collapsible sidebar
  - Desktop (> 1024px): Full sidebar

Theme:
- Colors: Gold (#D4AF37), Maroon (#800000), White, Light gray
- Professional wedding planner aesthetic
- Clean, minimal design
- Good contrast and readability
- Icons from react-icons library (FaHome, FaCalendar, etc.)

Components:
- Navigation component with logo, couple names, countdown
- Sidebar component with links and active state
- Main layout wrapper
- Mobile menu toggle
- Responsive design system

Styling:
- Use TailwindCSS
- Consistent spacing (8px grid)
- Professional font choices
- Hover effects on links
- Smooth transitions
- Mobile-first responsive design

Include:
- React hooks for mobile menu toggle
- Active route detection
- Logo/branding
- Professional typography
- Accessible navigation structure
- Mobile hamburger menu
- Touch-friendly menu items
```

## Prompt 3.10: Reusable UI Components

```
Create reusable UI components for the wedding planning app.

Create components in components/common/:

1. components/common/Button.tsx:
   - Props: variant (primary, secondary, danger), size (sm, md, lg), children
   - Primary: Blue background, white text
   - Secondary: Gray background, dark text
   - Danger: Red background, white text
   - Hover effects and transitions

2. components/common/Card.tsx:
   - Props: children, className, onClick
   - White background, shadow, rounded corners
   - Padding inside
   - Optional click handler

3. components/common/Modal.tsx:
   - Props: isOpen, onClose, title, children
   - Dark overlay with transparency
   - Centered card
   - Close button (X) in top right
   - Escape key to close
   - Click outside to close

4. components/common/Input.tsx:
   - Props: type, placeholder, value, onChange, label, error, required
   - Label display
   - Border and focus states
   - Error message display
   - Required indicator (*)

5. components/common/Select.tsx:
   - Props: options, value, onChange, label, placeholder
   - Dropdown component
   - Search/filter options (if many)
   - Label support
   - Error states

6. components/common/Badge.tsx:
   - Props: label, variant (success, warning, danger, info), size (sm, md)
   - Color-coded variants
   - Rounded pill style
   - Good readability

7. components/common/LoadingSpinner.tsx:
   - Props: size (sm, md, lg)
   - Animated spinning loader
   - Centered on page
   - Overlay for full-page loading

8. components/common/ErrorMessage.tsx:
   - Props: message, onRetry
   - Red background, clear message
   - Retry button
   - Close button

9. components/common/ConfirmDialog.tsx:
   - Props: title, message, onConfirm, onCancel, isDangerous (boolean)
   - Modal-style dialog
   - Two buttons: Cancel, Confirm
   - Red confirm button if dangerous action
   - Clear message

10. components/common/DatePicker.tsx:
    - Props: value, onChange, label, minDate, maxDate
    - Calendar popup on click
    - Date selection
    - Format: DD/MM/YYYY for India

11. components/common/StatCard.tsx:
    - Props: title, value, icon, trend (optional)
    - Display key statistics
    - Large number display
    - Optional icon
    - Optional trend indicator (+/- percentage)

12. components/common/Table.tsx:
    - Props: columns, data, onSort, sortColumn
    - Sortable columns (click header to sort)
    - Responsive table
    - Striped rows
    - Hover effects

Styling Guidelines:
- Use TailwindCSS consistently
- Colors: Gold (#D4AF37), Maroon (#800000), Blue (#3B82F6)
- Padding: 4px, 8px, 12px, 16px, 20px grid
- Rounded: sm (4px), md (8px), lg (12px)
- Shadows: light, medium, heavy
- Transitions: 200ms ease

Include:
- Full TypeScript support with proper Props interfaces
- Proper accessibility (aria labels, semantic HTML)
- Responsive design
- Hover and focus states
- Disabled state support
- Loading states
- Error state support
```

---

# PHASE 4: DEPLOYMENT

## Prompt 4.1: Vercel Configuration & Deployment

```
Create Vercel deployment configuration for the wedding planning app.

Generate 2 files:

FILE 1: vercel.json
- Configure build command: "npm run build"
- Configure dev command: "npm run dev"
- Configure install command: "npm install"
- Set framework: "nextjs"
- Add environment variables section comment

FILE 2: .github/workflows/deploy.yml (optional)
- GitHub Actions workflow for auto-deployment on push
- Runs on push to main branch
- Install dependencies
- Run tests (if any)
- Deploy to Vercel
- Show deployment URL in action summary

Include instructions for:
1. Setting up PostgreSQL database on Vercel
2. Copying connection string to environment variables
3. Running local migrations before first deployment
4. Setting up environment variables in Vercel dashboard

Commands to provide:
- npm run build (local testing)
- vercel deploy (manual deployment)
- vercel env pull (sync environment variables)
- npx prisma db push (push schema to production)
```

## Prompt 4.2: Environment Variables for Production

```
Create documentation and checklist for setting up production environment variables.

Generate a document with:

1. Required Environment Variables:
   - POSTGRES_PRISMA_URL (from Vercel PostgreSQL)
   - POSTGRES_URL_NON_POOLING (from Vercel PostgreSQL)
   - NEXT_PUBLIC_API_URL (set to your Vercel domain)

2. Step-by-step setup:
   - Create PostgreSQL database in Vercel console
   - Copy connection strings
   - Add to Vercel project settings
   - Verify connection locally
   - Run migrations
   - Deploy

3. Security checklist:
   - ✓ Never commit .env.local to git
   - ✓ Use .env.example as template
   - ✓ Regenerate secrets if exposed
   - ✓ Use non-pooling URL for migrations
   - ✓ Verify SSL connection

4. Troubleshooting:
   - Connection timeout errors
   - SSL certificate errors
   - Migration failures
   - Environment variable not found

5. Verification steps:
   - Test API endpoints after deployment
   - Check Prisma Studio: npx prisma studio
   - Monitor Vercel logs
   - Test CRUD operations
```

---

# IMPLEMENTATION CHECKLIST

## Step-by-Step Implementation Order

### Week 1: Foundation
- [x] Prompt 1.1: Initialize Next.js project
- [x] Prompt 1.2: Environment variables setup
- [x] Prompt 1.3: Prisma schema creation
- [x] Prompt 1.4: Database client and types

### Week 2: APIs
- [x] Prompt 2.1: Events API
- [x] Prompt 2.2: Food Menu API
- [x] Prompt 2.3: Guest Management API
- [x] Prompt 2.4: Staff API
- [x] Prompt 2.5: Gift Tracking API
- [x] Prompt 2.6: Sangeet API
- [x] Prompt 2.7: Guest Schedules API

### Week 3: Components
- [x] Prompt 3.10: Reusable UI components (start first!)
- [x] Prompt 3.1: Dashboard
- [x] Prompt 3.2: Events component
- [x] Prompt 3.3: Food Menu component
- [x] Prompt 3.4: Guest Management component
- [x] Prompt 3.5: Staff component
- [x] Prompt 3.6: Gift Tracking component
- [x] Prompt 3.7: Sangeet component
- [x] Prompt 3.8: Timeline component
- [x] Prompt 3.9: Navigation and Layout

### Week 4: Testing & Deployment
- [x] Test all CRUD operations
- [x] Test on mobile responsiveness
- [x] Prompt 4.1: Vercel configuration
- [x] Prompt 4.2: Production environment setup
- [x] Deploy to Vercel

## Quality Checklist

Before deploying, ensure:
- [ ] All forms have validation
- [ ] Error messages are user-friendly
- [ ] Loading states implemented
- [ ] No console errors
- [ ] Mobile responsive tested
- [ ] All API endpoints working
- [ ] Database migrations successful
- [ ] Environment variables set correctly
- [ ] HTTPS working on Vercel
- [ ] Performance acceptable

## Future Enhancements

After basic deployment, consider adding:
- Vendor ratings and reviews
- Guest communication (email invites)
- Photo gallery integration
- Budget analytics dashboard
- Vendor management portal
- Real-time collaboration (multiple users)
- Mobile app (React Native)
- Automated reminders
- Video content support
- Social sharing features
