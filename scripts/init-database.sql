-- ============================================
-- Wedding Planner App - Database Initialization
-- Neon Postgres Database Schema
-- ============================================
-- 
-- This SQL script creates all necessary tables, enums, and indexes
-- for the North Indian Wedding Planner application.
--
-- Usage:
--   1. Copy this entire script
--   2. Go to Neon Console → SQL Editor
--   3. Paste and execute
--   4. Verify all tables are created
--
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE event_type AS ENUM (
  'roka',
  'mehendi',
  'haldi',
  'sangeet',
  'baraat',
  'wedding',
  'reception',
  'walima',
  'custom'
);

CREATE TYPE rsvp_status AS ENUM (
  'pending',
  'confirmed',
  'declined',
  'maybe'
);

CREATE TYPE vendor_status AS ENUM (
  'pending_quote',
  'negotiating',
  'confirmed',
  'booked',
  'paid',
  'cancelled'
);

CREATE TYPE task_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

CREATE TYPE user_role AS ENUM (
  'owner',
  'coordinator',
  'family_member',
  'vendor'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Weddings table
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  venue TEXT,
  theme TEXT,
  color_scheme JSONB,
  default_guest_count INTEGER DEFAULT 0,
  budget DECIMAL(12, 2),
  owner_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS weddings_owner_idx ON weddings(owner_id);

-- Wedding Events table
CREATE TABLE IF NOT EXISTS wedding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type event_type NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  venue TEXT,
  description TEXT,
  expected_guests INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS wedding_events_wedding_idx ON wedding_events(wedding_id);
CREATE INDEX IF NOT EXISTS wedding_events_date_idx ON wedding_events(date);

-- Event Timeline table
CREATE TABLE IF NOT EXISTS event_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  activity TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  vendor_id UUID REFERENCES vendors(id),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS event_timeline_event_idx ON event_timeline(event_id);

-- ============================================
-- GUESTS
-- ============================================

-- Guest Groups table
CREATE TABLE IF NOT EXISTS guest_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  group_id UUID REFERENCES guest_groups(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  rsvp_status rsvp_status DEFAULT 'pending',
  rsvp_date TIMESTAMPTZ,
  plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  dietary_preferences JSONB,
  accommodation_needed BOOLEAN DEFAULT FALSE,
  accommodation_details JSONB,
  role TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS guests_wedding_idx ON guests(wedding_id);
CREATE INDEX IF NOT EXISTS guests_email_idx ON guests(email);

-- ============================================
-- VENDORS
-- ============================================

-- Vendors table (created before event_timeline to avoid FK issues)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status vendor_status DEFAULT 'pending_quote',
  rating INTEGER,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS vendors_wedding_idx ON vendors(wedding_id);
CREATE INDEX IF NOT EXISTS vendors_category_idx ON vendors(category);

-- Vendor Services table
CREATE TABLE IF NOT EXISTS vendor_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  rate DECIMAL(12, 2),
  unit TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vendor Assignments table
CREATE TABLE IF NOT EXISTS vendor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  service_id UUID REFERENCES vendor_services(id),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS vendor_assignments_vendor_idx ON vendor_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_assignments_event_idx ON vendor_assignments(event_id);

-- Vendor Contracts table
CREATE TABLE IF NOT EXISTS vendor_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  contract_date TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(12, 2) NOT NULL,
  deposit_amount DECIMAL(12, 2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_date TIMESTAMPTZ,
  advance_amount DECIMAL(12, 2),
  advance_paid BOOLEAN DEFAULT FALSE,
  advance_paid_date TIMESTAMPTZ,
  final_amount DECIMAL(12, 2),
  final_paid BOOLEAN DEFAULT FALSE,
  final_paid_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'INR',
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS vendor_contracts_vendor_idx ON vendor_contracts(vendor_id);

-- ============================================
-- BUDGET
-- ============================================

-- Budget Categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  allocated_amount DECIMAL(12, 2) DEFAULT '0',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS budget_categories_wedding_idx ON budget_categories(wedding_id);

-- Budget Items table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  estimated_amount DECIMAL(12, 2) NOT NULL,
  actual_amount DECIMAL(12, 2),
  vendor_id UUID REFERENCES vendors(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS budget_items_category_idx ON budget_items(category_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  budget_item_id UUID REFERENCES budget_items(id),
  vendor_id UUID REFERENCES vendors(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT NOT NULL,
  expense_date TIMESTAMPTZ DEFAULT NOW(),
  receipt_url TEXT,
  payment_method TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS expenses_wedding_idx ON expenses(wedding_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(expense_date);

-- ============================================
-- FOOD & MENUS
-- ============================================

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS menus_wedding_idx ON menus(wedding_id);
CREATE INDEX IF NOT EXISTS menus_event_idx ON menus(event_id);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_vegetarian BOOLEAN DEFAULT TRUE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_jain BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  serving_size TEXT,
  quantity INTEGER,
  "order" INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS menu_items_menu_idx ON menu_items(menu_id);

-- ============================================
-- DANCES & PERFORMANCES
-- ============================================

-- Dance Performances table
CREATE TABLE IF NOT EXISTS dance_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dance_type TEXT,
  song_name TEXT,
  song_artist TEXT,
  duration INTEGER,
  is_family_led BOOLEAN DEFAULT TRUE,
  choreographer_name TEXT,
  rehearsal_schedule JSONB,
  costume_requirements TEXT,
  music_url TEXT,
  video_url TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS dance_performances_wedding_idx ON dance_performances(wedding_id);
CREATE INDEX IF NOT EXISTS dance_performances_event_idx ON dance_performances(event_id);

-- Performance Participants table
CREATE TABLE IF NOT EXISTS performance_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID NOT NULL REFERENCES dance_performances(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  participant_name TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS performance_participants_performance_idx ON performance_participants(performance_id);

-- ============================================
-- TASKS
-- ============================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES wedding_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'not_started',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assigned_to TEXT,
  category TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS tasks_wedding_idx ON tasks(wedding_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);

-- Task Dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS task_dependencies_task_idx ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS task_dependencies_depends_on_idx ON task_dependencies(depends_on_task_id);

-- Task Checklists table
CREATE TABLE IF NOT EXISTS task_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS task_checklists_task_idx ON task_checklists(task_id);

-- ============================================
-- TRAVEL & LOGISTICS
-- ============================================

-- Guest Travel Details table
CREATE TABLE IF NOT EXISTS guest_travel_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  travel_type TEXT,
  departure_city TEXT,
  arrival_city TEXT,
  departure_date TIMESTAMPTZ,
  arrival_date TIMESTAMPTZ,
  departure_time TEXT,
  arrival_time TEXT,
  booking_reference TEXT,
  airline TEXT,
  flight_number TEXT,
  seat_number TEXT,
  return_departure_date TIMESTAMPTZ,
  return_arrival_date TIMESTAMPTZ,
  return_flight_number TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS guest_travel_details_guest_idx ON guest_travel_details(guest_id);

-- Accommodation Bookings table
CREATE TABLE IF NOT EXISTS accommodation_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  address TEXT,
  check_in_date TIMESTAMPTZ,
  check_out_date TIMESTAMPTZ,
  room_block TEXT,
  total_rooms INTEGER,
  booked_rooms INTEGER DEFAULT 0,
  rate_per_night DECIMAL(12, 2),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS accommodation_bookings_wedding_idx ON accommodation_bookings(wedding_id);

-- Transportation Arrangements table
CREATE TABLE IF NOT EXISTS transportation_arrangements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES wedding_events(id),
  vehicle_type TEXT,
  vehicle_count INTEGER DEFAULT 1,
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_time TIMESTAMPTZ,
  dropoff_time TIMESTAMPTZ,
  vendor_id UUID REFERENCES vendors(id),
  guest_ids JSONB,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS transportation_arrangements_wedding_idx ON transportation_arrangements(wedding_id);
CREATE INDEX IF NOT EXISTS transportation_arrangements_event_idx ON transportation_arrangements(event_id);

-- ============================================
-- FILES & MEDIA
-- ============================================

-- Media Files table
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  mime_type TEXT,
  file_size INTEGER,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS media_files_wedding_idx ON media_files(wedding_id);
CREATE INDEX IF NOT EXISTS media_files_entity_idx ON media_files(entity_type, entity_id);

-- ============================================
-- NOTES & COMMUNICATION
-- ============================================

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS notes_wedding_idx ON notes(wedding_id);
CREATE INDEX IF NOT EXISTS notes_entity_idx ON notes(entity_type, entity_id);

-- Communication Log table
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  communication_type TEXT,
  subject TEXT,
  content TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  initiated_by TEXT NOT NULL,
  outcome TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS communication_log_wedding_idx ON communication_log(wedding_id);
CREATE INDEX IF NOT EXISTS communication_log_entity_idx ON communication_log(entity_type, entity_id);

-- ============================================
-- USER ROLES & PERMISSIONS
-- ============================================

-- Wedding Users table
CREATE TABLE IF NOT EXISTS wedding_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role user_role DEFAULT 'family_member',
  permissions JSONB,
  invited_by TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS wedding_users_wedding_user_idx ON wedding_users(wedding_id, user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '✅ Database initialization complete!';
  RAISE NOTICE '✅ Created % tables', table_count;
END $$;

-- Display all created tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

