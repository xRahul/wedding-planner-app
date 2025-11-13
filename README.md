# Wedding Planner App

A comprehensive Progressive Web App (PWA) for planning North Indian weddings with guest management, vendor coordination, task tracking, budget management, ritual planning, and more.

## 🎯 Overview

This is a full-featured wedding planning application built with React 18 (via CDN), designed specifically for North Indian weddings. It runs entirely in the browser with local storage.

## ✨ Key Features

### 👥 Guest Management
- **Single & Family Entries**: Manage individual guests or entire families
- **RSVP Tracking**: Track confirmations (yes/pending/no)
- **Detailed Information**: Phone, dietary preferences (Veg/Jain), room assignments, arrival/departure dates
- **Aadhar Collection**: Track document collection for venue requirements
- **Gift Tracking**: Record gifts received with amounts and descriptions
- **Transport Needs**: Flag guests requiring transportation
- **Ceremony Participation**: Track which ceremonies each guest will attend
- **Categories & Relations**: Customizable categories and North Indian family relations
- **Side Tracking**: Separate bride's and groom's side guests
- **Enhanced Table View**: Improved fonts and column ordering for better readability

### 🤝 Vendor Management
- **40+ Vendor Types**: Pre-configured types including pandit, decorator, caterer, DJ, photographer, mehendi artist, band baja, dhol players, horse/ghodi rental, etc.
- **Custom Vendor Types**: Add your own vendor categories
- **Availability Slots**: Track multiple availability windows with date and time
- **Cost Tracking**: Estimated vs final costs, advance payments
- **Payment Responsibility**: Track who should pay (bride/groom/split)
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending)
- **Budget Category Linking**: Link vendors to budget categories for auto-calculation
- **Status Management**: Pending/Booked/Confirmed
- **Contact Details**: Phone, email, notes
- **Booking Dates**: Track when vendors are booked

### 💰 Budget Management
- **12 Budget Categories**: Venue, catering, decor, bride, groom, pandit & rituals, entertainment, photography, invitations, gifts, transport, other
- **Subcategories**: Break down each category further
- **Planned vs Actual**: Track estimated and actual spending
- **Bride/Groom Budget Tracking**: Separate budget tracking for bride and groom sides
- **Auto-Calculation**: Budget automatically calculates from linked items (vendors, menus, gifts, shopping, travel)
- **Payment Responsibility**: Track who should pay (bride/groom/split) for each expense
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending)
- **Expandable Categories**: Click to expand and view all linked items with individual costs
- **Budget Insights**: Breakdown showing manual actual vs linked actual costs with item counts
- **Progress Visualization**: Visual progress bars and percentage tracking
- **Real-time Calculations**: Automatic totals and remaining budget by side

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
- **Guest Count**: Track expected and attended guests per event
- **Menu Items**: Add dishes with price per plate
- **Item Editing**: Full edit support for menu items
- **Payment Responsibility**: Track who should pay (bride/groom/split) per item
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending) per item
- **Budget Category Linking**: Link menu items to budget categories for auto-calculation
- **Cost Calculation**: Automatic total cost per menu (expected vs actual)
- **Variance Tracking**: Track cost variance between expected and actual
- **North Indian Menu Templates**: Pre-built menu items with typical pricing

### 🎁 Gifts & Favors
- **Family Gifts**: Track gifts for family members by ceremony
- **Return Gifts**: Plan return gifts for guests
- **Special Gifts**: Track special gifts for VIPs
- **Analytics Tab**: Traditional North Indian guidelines (Shagun amounts, gold coins, dry fruits) and budget summary
- **Cost Tracking**: Auto-calculated totalCost = quantity × pricePerGift
- **Payment Responsibility**: Track who should pay (bride/groom/split)
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending)
- **Budget Category Linking**: Link gifts to budget categories for auto-calculation
- **Quantity Management**: Track quantities needed
- **Status**: Pending/Ordered/Purchased/Delivered
- **Common Gifts**: Pre-populated suggestions by category (family/return/special)
- **Custom Events**: Add custom events beyond default North Indian ceremonies

### 🛍️ Shopping Lists
- **Bride Shopping**: Organize by event (Wedding, Mehendi, Sangeet, Reception)
- **Groom Shopping**: Separate shopping list for groom
- **Family Shopping**: Track items needed for family members
- **Item Status**: Pending/Ordered/Received/Completed
- **Payment Responsibility**: Track who should pay (bride/groom/split)
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending)
- **Budget Category Linking**: Link shopping items to budget categories for auto-calculation
- **Cost Tracking**: Track budget per item
- **Shopping Templates**: Pre-built shopping lists by event:
  - Bride: Mehendi (Lehenga, Jewelry), Sangeet (Outfit, Dancing Shoes), Wedding (Bridal Lehenga, Jewelry Set), Reception (Gown/Saree, Jewelry)
  - Groom: Sangeet (Kurta, Mojaris), Wedding (Sherwani, Sehra, Kalgi), Reception (Suit)
  - Family: General (Coordination Outfits, Gift Wrapping Supplies)

### 🚌 Travel & Transport
- **Vehicle Management**: Track buses, cars, vans, tempo travelers, luxury coaches, SUVs, sedans
- **Date Ranges**: From/to dates for each vehicle
- **Capacity**: Track seats available
- **Cost**: Per vehicle and total costs
- **Payment Responsibility**: Track who should pay (bride/groom/split)
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending)
- **Budget Category Linking**: Link transport to budget categories for auto-calculation
- **Route Information**: Track pickup/drop locations with kilometers
- **Driver Details**: Track driver name and contact for each vehicle
- **Stats Dashboard**: Total cost, distance, vehicles, seats, cost per km, cost per seat
- **Travel Templates**: Common transport options (AC Bus for Baraat, Luxury Coach, Tempo Traveller) with one-click addition
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
- **Data Management**: Export/import JSON data with auto-dismiss notifications
- **Backup & Restore**: Full data backup and restore functionality
- **Custom Lists**: Manage custom categories, relations, dietary preferences (Veg/Jain)

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 (via CDN)
- **Transpiler**: Babel Standalone (for JSX in browser)
- **Storage**: LocalStorage
- **PWA**: Service Worker for offline functionality
- **Styling**: Custom CSS with CSS variables

### File Structure

```
wedding-planner-app/
├── index.html                          # Entry point with script loading order
├── app.js                              # Main app component and routing
├── storage.js                          # LocalStorage manager
├── utils.js                            # Utilities, validators, data structure
├── styles.css                          # Global styles
├── pwa.js                              # Service worker registration
├── service-worker.js                   # PWA service worker
├── manifest.json                       # PWA manifest
├── components/
│   ├── shared-components-bundle.js     # Shared UI components and hooks
│   ├── error-boundary.js               # Error boundary component
│   ├── notification-component.js       # Reusable notification system
│   ├── header-component.js             # Header with countdown
│   ├── tabs-component.js               # Navigation tabs with stats
│   ├── analytics-dashboard-components.js # Advanced analytics components
│   ├── enhanced-analytics.js           # Reusable analytics (Task, Shopping, Travel, Ritual)
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
├── tests/
│   └── analytics-tests.js              # Unit tests for analytics components
├── styles/
│   └── accessibility.css               # Accessibility-specific styles
├── utils/
│   └── security.js                     # Security utilities
└── icons/                              # PWA icons (72x72 to 512x512)
```

### Script Loading Order (Critical)

The app loads scripts in a specific order to ensure dependencies are available:

1. **utils/security.js** - Security utilities
2. **components/error-boundary.js** - Error handling
3. **storage.js** - Storage layer
4. **utils.js** - Utilities and data structure
5. **shared-components-bundle.js** - Shared components and hooks
6. **header-component.js** - Header
7. **tabs-component.js** - Navigation
8. **analytics-dashboard-components.js** - Dashboard analytics components
9. **enhanced-analytics.js** - Reusable analytics components
10. **dashboard-component.js** - Dashboard
11. **Feature components** - All feature-specific components
12. **notification-component.js** - Notification system
13. **app.js** - Main app (must be last)
14. **pwa.js** - PWA registration

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
- `useNotification` - Manages notification state with auto-dismiss functionality

**Constants:**
- `NORTH_INDIAN_RELATIONS` - Pre-defined family relations
- `NORTH_INDIAN_CEREMONIES` - Pre-defined ceremony types

### Data Structure

The app uses a single data object stored in localStorage:

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

**LocalStorage**: All data is stored locally in the browser with automatic persistence on every change. Works completely offline.

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)

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
- Set bride and groom budgets in Settings
- Add budget items to categories
- Track planned vs actual costs
- Budget auto-calculates from linked items (vendors, menus, gifts, shopping, travel)
- Track payment responsibility (bride/groom/split) for all expenses
- Track who actually paid (bride/groom/split/pending)
- Click categories to expand and view linked items
- View progress bars and percentages by side
- Monitor remaining budget for bride and groom sides

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

## 🔒 Security & Privacy

### Security Features
- **Input Sanitization**: All user inputs sanitized to prevent XSS attacks
- **Data Encryption**: Sensitive fields (phone, email, Aadhar) encrypted using AES-GCM 256-bit
- **Content Security Policy**: Restricts resource loading to trusted sources
- **Enhanced Validation**: Phone, email, name validation with security checks
- **Error Boundary**: Graceful error handling prevents app crashes

### Privacy
- All data stored locally in browser
- No external tracking or analytics
- No data sent to external servers
- User controls all data (export/delete)

### Security Utilities
```javascript
// Available globally via window.securityUtils
window.securityUtils.sanitizeInput(userInput);
window.securityUtils.isValidEmail(email);
window.securityUtils.encryptGuestData(guest);
```

## ♿ Accessibility

### WCAG 2.1 Level AA Compliant
- **Keyboard Navigation**: Full Tab/Shift+Tab support, visible focus indicators
- **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver, TalkBack
- **Skip Link**: Jump to main content (Tab from page load)
- **ARIA Labels**: All interactive elements properly labeled
- **Touch Targets**: Minimum 44x44px for mobile
- **Reduced Motion**: Respects prefers-reduced-motion setting
- **Color Contrast**: Meets WCAG AA standards (4.5:1)

### Keyboard Shortcuts
- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter**: Activate buttons/submit forms
- **Escape**: Close modals

## 🌐 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with PWA capabilities

## 📊 Code Statistics

- **Total Components**: 19 feature components
- **Shared Components**: 9 reusable UI components
- **Analytics Components**: 4 reusable analytics components (Task, Shopping, Travel, Ritual)
- **Custom Hooks**: 4 shared hooks
- **Code Reuse**: ~200 lines eliminated through shared components
- **Reduction**: ~18% code reduction with improved maintainability
- **Budget Integration**: 5 components with full budget category and payment tracking
- **Auto-Calculation**: Budget automatically calculates from 5 linked data sources
- **Unit Tests**: Comprehensive test suite for analytics components

## 🔧 Recent Improvements

### v2.6 - Enhanced Analytics & Testing
- **Enhanced Analytics Components**: Reusable analytics for Task, Shopping, Travel, and Ritual components
- **Toggle Analytics**: Show/hide analytics in all feature components for cleaner UI
- **Comprehensive Unit Tests**: Full test suite for analytics calculations with 13+ test cases
- **Analytics Dashboard**: Advanced analytics with Task Completion, Guest Analytics, Budget Health, and Vendor Performance
- **Visual Progress Tracking**: Progress bars, completion rates, and category breakdowns across all features

### v2.5 - Templates & Auto-Calculation
- **Auto-Budget Calculation**: Total budget automatically calculated from bride + groom budgets
- **Budget Insights**: Detailed breakdown showing manual vs linked actual costs
- **Gift Analytics Tab**: Traditional North Indian guidelines (Shagun amounts, gold coins, dry fruits) and budget summary
- **Shopping Templates**: Pre-built shopping lists for bride, groom, and family by event
- **Travel Templates**: Common transport options (AC Bus, Luxury Coach, Tempo Traveller) with one-click addition

### v2.4 - Payment Tracking & Budget Integration
- **Payment Responsibility Tracking**: Track who should pay (bride/groom/split) for all expenses
- **Paid By Tracking**: Track who actually paid (bride/groom/split/pending) for all budget items
- **Bride/Groom Budget Tracking**: Separate budget tracking for bride and groom sides with automatic calculation
- **Budget Auto-Calculation**: Budget automatically calculates from linked items (vendors, menus, gifts, shopping, travel)
- **Expandable Budget Categories**: Click to expand categories and view all linked items with individual costs

### v2.3 - Menu Enhancements
- **Menu Item Editing**: Full edit support for menu items with payment tracking

### v2.2 - UX Improvements
- **Dietary Preferences**: Simplified to Veg and Jain options only
- **Notification System**: Auto-dismissing notification banners for better UX

## 🧪 Testing

### Unit Tests
The app includes a comprehensive unit test suite for analytics components:

**Location**: `tests/analytics-tests.js`

**Test Coverage**:
- Task Completion Analytics (empty, basic, priority breakdown)
- Guest Analytics (empty, basic, RSVP, dietary preferences)
- Budget Health (empty, basic, linked vendors)
- Vendor Performance (empty, basic, by type)

**Running Tests**:
```javascript
// In browser console
AnalyticsTests.runAll();
// Returns: { passed, failed, results }
```

**Test Results**: 13+ test cases covering all analytics calculations

## 🛠️ Development

### Adding New Features
1. Create component in `components/` directory
2. Add script tag to `index.html` (before `app.js`)
3. Add tab in `tabs-component.js`
4. Add route in `app.js`
5. Update data structure in `utils.js` if needed
6. Add unit tests in `tests/` directory if adding analytics

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

### Analytics Pattern
```javascript
const [showAnalytics, setShowAnalytics] = useState(false);

// Toggle button
<button onClick={() => setShowAnalytics(!showAnalytics)}>
  {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
</button>

// Conditional rendering
{showAnalytics && <MyAnalytics data={data} />}
```

## 🐛 Troubleshooting

**Data not saving:**
- Check browser console for errors
- Verify localStorage is enabled
- Check storage quota
- Try exporting data as backup

**PWA not installing:**
- Ensure HTTPS or localhost
- Check manifest.json is accessible
- Verify service worker registration
- Clear browser cache and retry

**Dashboard showing errors:**
- Ensure wedding date is set in Settings
- Verify total budget is greater than 0
- Check that all required fields are filled

## 📚 Additional Documentation

- [AI_CONTEXT.md](AI_CONTEXT.md) - Comprehensive technical documentation for AI assistants and developers

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Please follow existing code patterns and component structure.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Indian Weddings**
