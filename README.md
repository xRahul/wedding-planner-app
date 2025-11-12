# Wedding Planner App

Complete wedding planning solution with guest management, vendor coordination, task tracking, budget management, and menu planning.

## Architecture

### Shared Components (`shared-components-bundle.js`)
Reusable UI components and hooks used across the app:

**Components:**
- `Modal` - Reusable modal dialog
- `FormField` - Form input with label and error handling
- `Badge` - Status badges with auto-coloring
- `EmptyState` - Empty state placeholder
- `Card` - Container with optional title and action
- `ActionButtons` - Edit/Delete button pair
- `SelectOrAddField` - Dropdown with "Add New" functionality

**Hooks:**
- `useCRUD` - Handles add/edit/save/delete operations and modal state
- `useFilter` - Manages filtering logic and state

### Core Files
- `index.html` - Entry point
- `app.js` - Main app component and routing
- `core-components.js` - Core UI components (Header, Navigation, etc.)
- `management-components.js` - Guest, Vendor, Task, Budget, Menu components
- `special-components.js` - Timeline, Seating, Gifts components
- `utils.js` - Utility functions and validators
- `storage.js` - Data persistence layer
- `db.js` - Database operations
- `styles.css` - Global styles

## Features

### Guests
- Single guest or family management
- RSVP tracking (yes/pending/no)
- Custom categories, relations, dietary preferences
- Room assignments and arrival/departure dates
- Aadhar card collection tracking
- Filter by category or RSVP status

### Vendors
- Custom vendor types
- Availability slot management
- Cost tracking (estimated + final)
- Status tracking (confirmed/booked/pending)
- Contact information management

### Tasks
- Priority levels (low/medium/high)
- Status tracking (pending/done)
- Deadline and assignment management
- Filter by status or priority

### Budget
- Category-based budget tracking
- Progress visualization
- Estimated vs actual cost tracking

### Menus
- Event-based menu planning
- Guest count tracking
- Menu item management with costs

## Development

The app uses React 18 via CDN with Babel for JSX transformation. All components are loaded via script tags in the correct dependency order.

### Script Loading Order
1. `shared-components-bundle.js` - Shared components/hooks
2. `core-components.js` - Core UI
3. `management-components.js` - Management features
4. `special-components.js` - Special features
5. `app.js` - Main app

## Code Reuse

The refactored architecture eliminates ~170 lines of duplicate code:
- `useCRUD` hook: ~60 lines saved per component
- `useFilter` hook: ~10 lines saved per component
- Shared UI components: Consistent styling and behavior
- `SelectOrAddField`: ~70 lines of duplicate code removed

Total reduction: ~15% with significantly improved maintainability.
