# Wedding Planner App

A comprehensive Progressive Web App (PWA) for planning North Indian weddings with guest management, vendor coordination, task tracking, budget management, ritual planning, and more.

## 🎯 Overview

This is a full-featured wedding planning application built with React 18 (via CDN), designed specifically for North Indian weddings. It runs entirely in the browser with local storage and optional Neon Postgres database sync.

## ✨ Key Features

### 👥 Guest Management
- **Single & Family Entries**: Manage individual guests or entire families
- **RSVP Tracking**: Track confirmations (yes/pending/no)
- **Detailed Information**: Phone, dietary preferences, room assignments, arrival/departure dates
- **Aadhar Collection**: Track document collection for venue requirements
- **Gift Tracking**: Record gifts received with amounts and descriptions
- **Transport Needs**: Flag guests requiring transportation
- **Ceremony Participation**: Track which ceremonies each guest will attend
- **Categories & Relations**: Customizable categories and North Indian family relations
- **Side Tracking**: Separate bride's and groom's side guests

### 🤝 Vendor Management
- **40+ Vendor Types**: Pre-configured types including pandit, decorator, caterer, DJ, photographer, mehendi artist, band baja, dhol players, horse/ghodi rental, etc.
- **Custom Vendor Types**: Add your own vendor categories
- **Availability Slots**: Track multiple availability windows with date and time
- **Cost Tracking**: Estimated vs final costs, advance payments
- **Status Management**: Pending/Booked/Confirmed
- **Contact Details**: Phone, email, notes
- **Booking Dates**: Track when vendors are booked

### 💰 Budget Management
- **12 Budget Categories**: Venue, catering, decor, bride, groom, pandit & rituals, entertainment, photography, invitations, gifts, transport, other
- **Subcategories**: Break down each category further
- **Planned vs Actual**: Track estimated and actual spending
- **Progress Visualization**: Visual progress bars and percentage tracking
- **Real-time Calculations**: Automatic totals and remaining budget

### ✅ Task Management
- **Priority Levels**: Low/Medium/High
- **Status Tracking**: Pending/Done with checkbox toggle
- **Deadlines**: Set and track due dates
- **Assignment**: Assign tasks to specific people
- **Categories**: Organize by vendor, preparation, shopping, transport, decoration, catering
- **Templates**: Pre-built North Indian wedding task templates
- **Overdue Tracking**: Automatic identification of overdue tasks

### 🪔 Rituals & Customs
- **Pre-Wedding Ceremonies**: Roka, Sagan, Tilak, Ring Ceremony, Mehendi, Sangeet, Haldi, Ganesh Puja, etc.
- **Main Ceremonies**: Baraat, Milni, Jaimala, Kanyadaan, Pheras, Sindoor, Vidai, Reception, etc.
- **Post-Wedding**: Grih Pravesh, Pag Phera, Mooh Dikhai
- **Ritual Items**: Track items needed for each ceremony
- **Completion Status**: Mark ceremonies as completed
- **Notes**: Add specific details for each ritual

### 🍽️ Menu Planning
- **Event-Based Menus**: Create separate menus for different events
- **Guest Count**: Track expected attendees per event
- **Menu Items**: Add dishes with costs
- **Dietary Tracking**: Automatic veg/non-veg guest counts
- **Cost Calculation**: Automatic total cost per menu

### 🎁 Gifts & Favors
- **Family Gifts**: Track gifts for family members by ceremony
- **Return Gifts**: Plan return gifts for guests
- **Special Gifts**: Track special gifts for VIPs
- **Cost Tracking**: Budget and actual costs
- **Quantity Management**: Track quantities needed
- **Status**: Purchased/Pending

### 🛍️ Shopping Lists
- **Bride Shopping**: Organize by event (Wedding, Mehendi, Sangeet, etc.)
- **Groom Shopping**: Separate shopping list for groom
- **Family Shopping**: Track items needed for family members
- **Item Status**: Mark items as purchased
- **Cost Tracking**: Track estimated and actual costs

### 🚌 Travel & Transport
- **Vehicle Management**: Track buses, cars, tempo travelers, etc.
- **Date Ranges**: From/to dates for each vehicle
- **Capacity**: Track seats available
- **Cost**: Per vehicle and total costs
- **Route Information**: Track pickup/drop locations
- **Guest Matching**: Compare transport capacity with guest needs

### 📅 Timeline
- **Day-Based Planning**: Organize events by days before/after wedding
- **Ceremony Scheduling**: Add ceremonies with dates and times
- **Location Tracking**: Track venue for each event
- **Visual Timeline**: See all events in chronological order
- **Day Labels**: Automatic "X days before/after" labels

### 📊 Dashboard
- **Real-time Stats**: Days until wedding, confirmed guests, budget usage, pending tasks
- **Progress Tracking**: Visual progress for tasks, guests, vendors, rituals
- **Alerts System**: Critical alerts for overdue tasks, budget overruns, pending confirmations
- **Category Breakdowns**: Detailed stats by category
- **Smart Insights**: Average costs, completion percentages, recommendations
- **Quick Actions**: Priority actions based on wedding timeline

### ⚙️ Settings
- **Wedding Info**: Bride/groom names, date, location, total budget
- **Data Management**: Export/import JSON data
- **Backup & Restore**: Full data backup and restore functionality
- **Custom Lists**: Manage custom categories, relations, dietary preferences

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 (via CDN)
- **Transpiler**: Babel Standalone (for JSX in browser)
- **Storage**: LocalStorage + Optional Neon Postgres
- **PWA**: Service Worker for offline functionality
- **Styling**: Custom CSS with CSS variables

### File Structure

```
wedding-planner-app/
├── index.html                          # Entry point with script loading order
├── app.js                              # Main app component and routing
├── db.js                               # Neon Postgres database integration
├── storage.js                          # LocalStorage manager
├── utils.js                            # Utilities, validators, data structure
├── styles.css                          # Global styles
├── pwa.js                              # Service worker registration
├── service-worker.js                   # PWA service worker
├── manifest.json                       # PWA manifest
├── env.js                              # Environment configuration
├── components/
│   ├── shared-components-bundle.js     # Shared UI components and hooks
│   ├── header-component.js             # Header with countdown
│   ├── tabs-component.js               # Navigation tabs with stats
│   ├── dashboard-component.js          # Dashboard with analytics
│   ├── timeline-component.js           # Timeline management
│   ├── guest-components.js             # Guest management
│   ├── vendor-components.js            # Vendor management
│   ├── budget-components.js            # Budget tracking
│   ├── task-components.js              # Task management
│   ├── menu-components.js              # Menu planning
│   ├── ritual-components.js            # Rituals & customs
│   ├── gift-components.js              # Gifts & favors
│   ├── shopping-components.js          # Shopping lists
│   ├── travel-components.js            # Travel & transport
│   └── setting-components.js           # Settings & data management
└── icons/                              # PWA icons (72x72 to 512x512)
```

### Script Loading Order (Critical)

The app loads scripts in a specific order to ensure dependencies are available:

1. **env.js** - Environment configuration
2. **db.js** - Database layer
3. **storage.js** - Storage layer
4. **utils.js** - Utilities and data structure
5. **shared-components-bundle.js** - Shared components and hooks
6. **header-component.js** - Header
7. **tabs-component.js** - Navigation
8. **dashboard-component.js** - Dashboard
9. **Feature components** - All feature-specific components
10. **app.js** - Main app (must be last)
11. **pwa.js** - PWA registration

### Shared Components (`shared-components-bundle.js`)

**UI Components:**
- `Modal` - Reusable modal dialog with header, body, footer
- `FormField` - Form input with label and error handling
- `Badge` - Status badges with auto-coloring based on status
- `ProgressRing` - Circular progress indicator
- `QuickStats` - Stats display grid
- `EmptyState` - Empty state placeholder with icon
- `Card` - Container with optional title and action button
- `ActionButtons` - Edit/Delete button pair
- `SelectOrAddField` - Dropdown with "Add New" functionality

**Hooks:**
- `useCRUD` - Handles add/edit/save/delete operations and modal state (~60 lines saved per component)
- `useWeddingProgress` - Calculates wedding planning progress metrics
- `useFilter` - Manages filtering logic and state (~10 lines saved per component)

**Constants:**
- `NORTH_INDIAN_RELATIONS` - Pre-defined family relations
- `NORTH_INDIAN_CEREMONIES` - Pre-defined ceremony types

### Data Structure

The app uses a single data object stored in localStorage and optionally synced to Neon Postgres:

```javascript
{
  weddingInfo: {
    brideName: string,
    groomName: string,
    weddingDate: string,
    location: string,
    totalBudget: number
  },
  savedGuestCategories: string[],
  savedGuestRelations: string[],
  savedDietaryPreferences: string[],
  savedFamilyRelations: string[],
  customCeremonies: string[],
  customGiftEvents: string[],
  customVendorTypes: string[],
  timeline: Event[],
  guests: Guest[],
  vendors: Vendor[],
  budget: BudgetCategory[],
  tasks: Task[],
  menus: Menu[],
  travel: { transport: Transport[] },
  ritualsAndCustoms: {
    preWedding: Ritual[],
    mainCeremonies: Ritual[],
    customs: Custom[]
  },
  giftsAndFavors: {
    familyGifts: Gift[],
    returnGifts: Gift[],
    specialGifts: Gift[]
  },
  shopping: {
    bride: ShoppingList[],
    groom: ShoppingList[],
    family: ShoppingList[]
  },
  traditions: {
    preWedding: Tradition[],
    ritual_items: RitualItem[]
  }
}
```

### Storage Strategy

**Dual Storage System:**
1. **LocalStorage** (Primary): Immediate persistence, works offline
2. **Neon Postgres** (Optional): Cloud sync when configured

**Auto-save**: Data saves automatically on every change

**Error Handling**: Falls back to localStorage if database fails

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Neon Postgres database for cloud sync

### Installation

1. Clone the repository
2. Serve the files using any static file server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### Configuration

**Optional Database Setup:**

Create `.env.example` file:
```javascript
window.ENV = {
  NEON_DB_HOST: 'your-project.neon.tech',
  NEON_DB_NAME: 'wedding_planner',
  NEON_DB_USER: 'your-username',
  NEON_DB_PASSWORD: 'your-password'
};
```

Copy to `env.js` and update with your credentials.

### PWA Installation

The app can be installed as a Progressive Web App:
1. Open the app in a browser
2. Click the install prompt or use browser's "Install App" option
3. App will work offline after installation

## 📱 Usage

### Initial Setup
1. Go to **Settings** tab
2. Enter bride and groom names
3. Set wedding date and location
4. Set total budget
5. Start adding guests, vendors, and tasks

### Guest Management
- Click "Add Guest" to add single guest or family
- Use filters to view by category or RSVP status
- Track Aadhar collection and room assignments
- Record gifts received

### Vendor Management
- Add vendors with type, contact, and cost
- Track availability slots
- Mark as booked/confirmed
- Record advance payments

### Task Management
- Add tasks with priority and deadline
- Use "Add Wedding Templates" for common tasks
- Check off completed tasks
- Filter by status or priority

### Budget Tracking
- Add budget items to categories
- Track planned vs actual costs
- View progress bars and percentages
- Monitor remaining budget

### Rituals Planning
- Add pre-wedding and main ceremonies
- Track ritual items needed
- Mark ceremonies as completed
- Add notes for each ritual

## 🎨 Customization

### Adding Custom Categories
- Use "Add New" option in dropdowns
- Custom values are saved and reused
- Managed in Settings tab

### Custom Vendor Types
- Add custom vendor types when creating vendors
- Automatically saved for future use

### Styling
- Edit `styles.css` for visual customization
- Uses CSS variables for easy theming

## 💾 Data Management

### Export Data
1. Go to Settings tab
2. Click "Export Data"
3. JSON file downloads with all data

### Import Data
1. Go to Settings tab
2. Click "Import Data"
3. Select previously exported JSON file

### Backup Strategy
- Regular exports recommended
- Data persists in localStorage
- Optional cloud sync with Neon Postgres

## 🔒 Security & Privacy

- All data stored locally in browser
- No external tracking or analytics
- Optional database sync requires explicit configuration
- Export data for external backups

## 🌐 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with PWA capabilities

## 📊 Code Statistics

- **Total Components**: 15+ feature components
- **Shared Components**: 8 reusable UI components
- **Custom Hooks**: 3 shared hooks
- **Code Reuse**: ~170 lines eliminated through shared components
- **Reduction**: ~15% code reduction with improved maintainability

## 🛠️ Development

### Adding New Features
1. Create component in `components/` directory
2. Add script tag to `index.html` (before `app.js`)
3. Add tab in `tabs-component.js`
4. Add route in `app.js`
5. Update data structure in `utils.js` if needed

### Component Pattern
```javascript
const MyComponent = ({ data, updateData }) => {
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
    = useCRUD(data, updateData, 'dataKey', validator);
  
  return (
    <Card title="My Feature" action={<button onClick={() => handleAdd({...})}>Add</button>}>
      {/* Component content */}
    </Card>
  );
};
```

## 🐛 Troubleshooting

**Data not saving:**
- Check browser console for errors
- Verify localStorage is enabled
- Check storage quota

**Database sync failing:**
- Verify env.js configuration
- Check network connectivity
- Confirm database credentials

**PWA not installing:**
- Ensure HTTPS or localhost
- Check manifest.json is accessible
- Verify service worker registration

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Please follow existing code patterns and component structure.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Indian Weddings**
