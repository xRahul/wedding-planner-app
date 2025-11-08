import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  integer,
  decimal,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const eventTypeEnum = pgEnum('event_type', [
  'roka',
  'mehendi',
  'haldi',
  'sangeet',
  'baraat',
  'wedding',
  'reception',
  'walima',
  'custom',
]);

export const rsvpStatusEnum = pgEnum('rsvp_status', [
  'pending',
  'confirmed',
  'declined',
  'maybe',
]);

export const vendorStatusEnum = pgEnum('vendor_status', [
  'pending_quote',
  'negotiating',
  'confirmed',
  'booked',
  'paid',
  'cancelled',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'cancelled',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'coordinator',
  'family_member',
  'vendor',
]);

// Core Tables
export const weddings = pgTable('weddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  brideName: text('bride_name').notNull(),
  groomName: text('groom_name').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  location: text('location'),
  venue: text('venue'),
  theme: text('theme'),
  colorScheme: jsonb('color_scheme'), // { primary: '#...', secondary: '#...' }
  defaultGuestCount: integer('default_guest_count').default(0),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  ownerId: text('owner_id').notNull(), // References neon_auth.users_sync.id
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  ownerIdx: index('weddings_owner_idx').on(table.ownerId),
}));

export const weddingEvents = pgTable('wedding_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  eventType: eventTypeEnum('event_type').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  venue: text('venue'),
  description: text('description'),
  expectedGuests: integer('expected_guests'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('wedding_events_wedding_idx').on(table.weddingId),
  dateIdx: index('wedding_events_date_idx').on(table.date),
}));

export const eventTimeline = pgTable('event_timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  time: text('time').notNull(),
  activity: text('activity').notNull(),
  description: text('description'),
  assignedTo: text('assigned_to'), // References neon_auth.users_sync.id
  vendorId: uuid('vendor_id').references(() => vendors.id),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventIdx: index('event_timeline_event_idx').on(table.eventId),
}));

// Guests
export const guestGroups = pgTable('guest_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  groupId: uuid('group_id').references(() => guestGroups.id, { onDelete: 'set null' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  rsvpStatus: rsvpStatusEnum('rsvp_status').default('pending'),
  rsvpDate: timestamp('rsvp_date', { withTimezone: true }),
  plusOne: boolean('plus_one').default(false),
  plusOneName: text('plus_one_name'),
  dietaryPreferences: jsonb('dietary_preferences'), // { vegetarian: true, vegan: false, jain: false, glutenFree: false }
  accommodationNeeded: boolean('accommodation_needed').default(false),
  accommodationDetails: jsonb('accommodation_details'),
  role: text('role'), // Family member role
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('guests_wedding_idx').on(table.weddingId),
  emailIdx: index('guests_email_idx').on(table.email),
}));

// Vendors
export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // caterer, photographer, decorator, etc.
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  status: vendorStatusEnum('status').default('pending_quote'),
  rating: integer('rating'), // 1-5
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('vendors_wedding_idx').on(table.weddingId),
  categoryIdx: index('vendors_category_idx').on(table.category),
}));

export const vendorServices = pgTable('vendor_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  serviceName: text('service_name').notNull(),
  description: text('description'),
  rate: decimal('rate', { precision: 12, scale: 2 }),
  unit: text('unit'), // per hour, per day, per person, etc.
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vendorAssignments = pgTable('vendor_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => vendorServices.id),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  vendorIdx: index('vendor_assignments_vendor_idx').on(table.vendorId),
  eventIdx: index('vendor_assignments_event_idx').on(table.eventId),
}));

export const vendorContracts = pgTable('vendor_contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  contractDate: timestamp('contract_date', { withTimezone: true }).defaultNow(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 12, scale: 2 }),
  depositPaid: boolean('deposit_paid').default(false),
  depositPaidDate: timestamp('deposit_paid_date', { withTimezone: true }),
  advanceAmount: decimal('advance_amount', { precision: 12, scale: 2 }),
  advancePaid: boolean('advance_paid').default(false),
  advancePaidDate: timestamp('advance_paid_date', { withTimezone: true }),
  finalAmount: decimal('final_amount', { precision: 12, scale: 2 }),
  finalPaid: boolean('final_paid').default(false),
  finalPaidDate: timestamp('final_paid_date', { withTimezone: true }),
  currency: text('currency').default('INR'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  vendorIdx: index('vendor_contracts_vendor_idx').on(table.vendorId),
}));

// Budget
export const budgetCategories = pgTable('budget_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  allocatedAmount: decimal('allocated_amount', { precision: 12, scale: 2 }).default('0'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('budget_categories_wedding_idx').on(table.weddingId),
}));

export const budgetItems = pgTable('budget_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => budgetCategories.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  estimatedAmount: decimal('estimated_amount', { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('budget_items_category_idx').on(table.categoryId),
}));

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => budgetCategories.id),
  budgetItemId: uuid('budget_item_id').references(() => budgetItems.id),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('INR'),
  description: text('description').notNull(),
  expenseDate: timestamp('expense_date', { withTimezone: true }).defaultNow(),
  receiptUrl: text('receipt_url'),
  paymentMethod: text('payment_method'), // cash, card, bank_transfer, etc.
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('expenses_wedding_idx').on(table.weddingId),
  dateIdx: index('expenses_date_idx').on(table.expenseDate),
}));

// Food & Menus
export const menus = pgTable('menus', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  approved: boolean('approved').default(false),
  approvedBy: text('approved_by'), // References neon_auth.users_sync.id
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('menus_wedding_idx').on(table.weddingId),
  eventIdx: index('menus_event_idx').on(table.eventId),
}));

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  menuId: uuid('menu_id').references(() => menus.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // appetizer, main_course, dessert, beverage, etc.
  isVegetarian: boolean('is_vegetarian').default(true),
  isVegan: boolean('is_vegan').default(false),
  isJain: boolean('is_jain').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  servingSize: text('serving_size'),
  quantity: integer('quantity'),
  order: integer('order').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  menuIdx: index('menu_items_menu_idx').on(table.menuId),
}));

// Dances & Performances
export const dancePerformances = pgTable('dance_performances', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  danceType: text('dance_type'), // bhangra, gidda, garba, etc.
  songName: text('song_name'),
  songArtist: text('song_artist'),
  duration: integer('duration'), // in minutes
  isFamilyLed: boolean('is_family_led').default(true),
  choreographerName: text('choreographer_name'),
  rehearsalSchedule: jsonb('rehearsal_schedule'),
  costumeRequirements: text('costume_requirements'),
  musicUrl: text('music_url'),
  videoUrl: text('video_url'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('dance_performances_wedding_idx').on(table.weddingId),
  eventIdx: index('dance_performances_event_idx').on(table.eventId),
}));

export const performanceParticipants = pgTable('performance_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  performanceId: uuid('performance_id').references(() => dancePerformances.id, { onDelete: 'cascade' }).notNull(),
  guestId: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }),
  participantName: text('participant_name'), // For non-guest participants
  role: text('role'), // lead, backup, etc.
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  performanceIdx: index('performance_participants_performance_idx').on(table.performanceId),
}));

// Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => weddingEvents.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('not_started'),
  priority: taskPriorityEnum('priority').default('medium'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  assignedTo: text('assigned_to'), // References neon_auth.users_sync.id
  category: text('category'), // vendor_coordination, guest_management, decoration, food, etc.
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: text('completed_by'), // References neon_auth.users_sync.id
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('tasks_wedding_idx').on(table.weddingId),
  statusIdx: index('tasks_status_idx').on(table.status),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
}));

export const taskDependencies = pgTable('task_dependencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  dependsOnTaskId: uuid('depends_on_task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('task_dependencies_task_idx').on(table.taskId),
  dependsOnIdx: index('task_dependencies_depends_on_idx').on(table.dependsOnTaskId),
}));

export const taskChecklists = pgTable('task_checklists', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  item: text('item').notNull(),
  completed: boolean('completed').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('task_checklists_task_idx').on(table.taskId),
}));

// Travel & Logistics
export const guestTravelDetails = pgTable('guest_travel_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestId: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  travelType: text('travel_type'), // flight, train, car, etc.
  departureCity: text('departure_city'),
  arrivalCity: text('arrival_city'),
  departureDate: timestamp('departure_date', { withTimezone: true }),
  arrivalDate: timestamp('arrival_date', { withTimezone: true }),
  departureTime: text('departure_time'),
  arrivalTime: text('arrival_time'),
  bookingReference: text('booking_reference'),
  airline: text('airline'),
  flightNumber: text('flight_number'),
  seatNumber: text('seat_number'),
  returnDepartureDate: timestamp('return_departure_date', { withTimezone: true }),
  returnArrivalDate: timestamp('return_arrival_date', { withTimezone: true }),
  returnFlightNumber: text('return_flight_number'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  guestIdx: index('guest_travel_details_guest_idx').on(table.guestId),
}));

export const accommodationBookings = pgTable('accommodation_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  hotelName: text('hotel_name').notNull(),
  address: text('address'),
  checkInDate: timestamp('check_in_date', { withTimezone: true }),
  checkOutDate: timestamp('check_out_date', { withTimezone: true }),
  roomBlock: text('room_block'),
  totalRooms: integer('total_rooms'),
  bookedRooms: integer('booked_rooms').default(0),
  ratePerNight: decimal('rate_per_night', { precision: 12, scale: 2 }),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('accommodation_bookings_wedding_idx').on(table.weddingId),
}));

export const transportationArrangements = pgTable('transportation_arrangements', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => weddingEvents.id),
  vehicleType: text('vehicle_type'), // car, bus, tempo, etc.
  vehicleCount: integer('vehicle_count').default(1),
  pickupLocation: text('pickup_location'),
  dropoffLocation: text('dropoff_location'),
  pickupTime: timestamp('pickup_time', { withTimezone: true }),
  dropoffTime: timestamp('dropoff_time', { withTimezone: true }),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  guestIds: jsonb('guest_ids'), // Array of guest IDs
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('transportation_arrangements_wedding_idx').on(table.weddingId),
  eventIdx: index('transportation_arrangements_event_idx').on(table.eventId),
}));

// Files & Media
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'), // image, document, video, etc.
  mimeType: text('mime_type'),
  fileSize: integer('file_size'),
  entityType: text('entity_type'), // vendor, guest, task, event, etc.
  entityId: uuid('entity_id'),
  description: text('description'),
  metadata: jsonb('metadata'),
  uploadedBy: text('uploaded_by'), // References neon_auth.users_sync.id
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('media_files_wedding_idx').on(table.weddingId),
  entityIdx: index('media_files_entity_idx').on(table.entityType, table.entityId),
}));

// Notes & Communication
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }),
  entityType: text('entity_type'), // vendor, guest, task, event, etc.
  entityId: uuid('entity_id'),
  content: text('content').notNull(),
  createdBy: text('created_by').notNull(), // References neon_auth.users_sync.id
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  weddingIdx: index('notes_wedding_idx').on(table.weddingId),
  entityIdx: index('notes_entity_idx').on(table.entityType, table.entityId),
}));

export const communicationLog = pgTable('communication_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }),
  entityType: text('entity_type'), // vendor, guest, etc.
  entityId: uuid('entity_id'),
  communicationType: text('communication_type'), // email, phone, meeting, etc.
  subject: text('subject'),
  content: text('content'),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
  initiatedBy: text('initiated_by').notNull(), // References neon_auth.users_sync.id
  outcome: text('outcome'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingIdx: index('communication_log_wedding_idx').on(table.weddingId),
  entityIdx: index('communication_log_entity_idx').on(table.entityType, table.entityId),
}));

// User Roles & Permissions
export const weddingUsers = pgTable('wedding_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  weddingId: uuid('wedding_id').references(() => weddings.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(), // References neon_auth.users_sync.id
  role: userRoleEnum('role').default('family_member'),
  permissions: jsonb('permissions'),
  invitedBy: text('invited_by'), // References neon_auth.users_sync.id
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow(),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  weddingUserIdx: index('wedding_users_wedding_user_idx').on(table.weddingId, table.userId),
}));

