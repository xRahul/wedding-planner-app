# AI Context Document - Wedding Planner App

This document provides comprehensive context for AI assistants (LLMs) to understand and work with this codebase effectively.

## 🎯 Project Purpose

A Progressive Web App for planning North Indian weddings with comprehensive features for guest management, vendor coordination, budget tracking, ritual planning, and more. Built with React 18 via CDN, runs entirely in browser with localStorage.

## 🏗️ Architecture Overview

### Technology Stack
- **React 18.2.0** - Loaded via CDN (production build)
- **Babel Standalone 7.23.2** - JSX transpilation in browser
- **No Build System** - Direct script loading, no webpack/vite
- **Storage**: LocalStorage
- **PWA**: Service Worker for offline capability

### Critical Design Decisions

1. **No Build Step**: All React code uses `type="text/babel"` and transpiles in browser
2. **Script Order Matters**: Dependencies must load before dependents (see index.html)
3. **Global State**: Single data object passed down via props (no Redux/Context)
4. **Auto-save**: Every data change triggers save to localStorage

## 📁 File Structure & Responsibilities

### Core Files

**index.html**
- Entry point
- Loads React, ReactDOM, Babel from CDN
- Defines script loading order (CRITICAL - must be maintained)
- All scripts use `defer` and `type="text/babel"`

**app.js**
- Main `WeddingPlannerApp` component
- Manages global state (`data` object)
- Uses `useNotification` hook for notifications
- Handles data loading/saving
- Routing logic (tab-based navigation)
- Must load LAST (after all components)

**utils.js**
- `DEFAULT_DATA` - Complete data structure template
- `loadData()` / `saveData()` - Data persistence functions
- Validation functions: `validateGuest`, `validateVendor`, etc.
- Utility functions: `formatDate`, `formatCurrency`, `generateId`, etc.
- Must load BEFORE components

**storage.js**
- `StorageManager` singleton class
- LocalStorage operations
- Change listeners for data sync
- Error handling for quota exceeded

**styles.css**
- CSS variables for theming
- Responsive grid layouts
- Component-specific styles
- Notification banner styles
- No CSS-in-JS

### Component Files

**components/shared-components-bundle.js** (MUST LOAD FIRST)
- Shared UI components used by all features
- Custom hooks for common patterns
- North Indian wedding constants
- Components: `Modal`, `FormField`, `Badge`, `Card`, `ActionButtons`, `SelectOrAddField`, etc.
- Hooks: `useCRUD`, `useFilter`, `useWeddingProgress`

**components/error-boundary.js**
- `ErrorBoundary` component
- Catches React errors and displays fallback UI
- Provides recovery option

**components/notification-component.js**
- `Notification` component - Auto-dismissing notification banner
- `useNotification` hook - Manages notification state with `showNotification` and `closeNotification`
- Reusable across all components
- Auto-dismisses after 3 seconds
- Uses `useRef` to prevent double rendering

**components/header-component.js**
- `Header` component
- Displays bride/groom names, date, location
- Countdown to wedding day
- Quick stats display

**components/tabs-component.js**
- `Tabs` component
- Navigation between features
- Shows stats badges on tabs
- Alert indicators for urgent items

**components/analytics-dashboard-components.js**
- Advanced analytics components
- `TaskCompletionAnalytics`, `GuestAnalytics`, `BudgetHealthScorecard`
- `VendorPerformanceSummary`, `EventReadinessTracker`
- `TimelinePressureIndex`, `SmartRecommendations`, `WeeklyProgressReport`

**components/dashboard-component.js**
- `Dashboard` component
- Real-time statistics and analytics
- Alert system for critical items
- Progress tracking for all features
- Smart insights and recommendations
- Shows Veg/Jain dietary counts (no non-veg)

**Feature Components** (guest, vendor, budget, task, menu, ritual, gift, shopping, travel, setting)
- Each manages one feature area
- Follows consistent pattern: list view + modal for add/edit
- Uses `useCRUD` hook for common operations
- Props: `{data, updateData}` or specific data slice
- Settings component receives `showNotification` prop

**utils/security.js**
- Security utilities for input sanitization
- Data encryption functions (AES-GCM 256-bit)
- Validation functions for email, phone, names

**styles/accessibility.css**
- Accessibility-specific styles
- Focus indicators, skip links (fixed positioning), screen reader support
- Reduced motion support

## 🔄 Data Flow

### Data Structure
```javascript
{
  weddingInfo: { brideName, groomName, weddingDate, location, totalBudget },
  savedGuestCategories: string[],
  savedGuestRelations: string[],
  savedDietaryPreferences: string[], // Default: ['veg', 'jain']
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
  ritualsAndCustoms: { preWedding: Ritual[], mainCeremonies: Ritual[], customs: Custom[] },
  giftsAndFavors: { familyGifts: Gift[], returnGifts: Gift[], specialGifts: Gift[] },
  shopping: { bride: ShoppingList[], groom: ShoppingList[], family: ShoppingList[] },
  traditions: { preWedding: Tradition[], ritual_items: RitualItem[] }
}
```

### State Management Pattern
1. **App.js** holds entire `data` state
2. `updateData(key, value)` function passed to all components
3. Components call `updateData('guests', newGuestsArray)` to update
4. App.js triggers save on every data change
5. Notification state managed via `useNotification` hook

### CRUD Pattern (via useCRUD hook)
```javascript
const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
  = useCRUD(items, updateData, 'dataKey', validator);

// handleAdd - Opens modal with new item template
// handleEdit - Opens modal with existing item
// handleSave - Validates, updates array, calls updateData
// handleDelete - Confirms, removes from array, calls updateData
```

### Notification Pattern (via useNotification hook)
```javascript
const { notification, showNotification, closeNotification } = useNotification();

// Show notification
showNotification('Data imported successfully!', 'success'); // or 'info'

// Render notification
{notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
```

## 🎨 Component Patterns

### Standard Feature Component Structure
```javascript
const FeatureName = ({ data, updateData }) => {
  // 1. Use CRUD hook
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
    = useCRUD(data, updateData, 'dataKey', validator);
  
  // 2. Use filter hook (optional)
  const [filtered, filter, setFilter] = useFilter(data, filterFn);
  
  // 3. Calculate stats (useMemo)
  const stats = useMemo(() => ({ /* calculations */ }), [data]);
  
  // 4. Render Card with list and action button
  return (
    <div>
      <Card title="Feature" action={<button onClick={() => handleAdd({...})}>Add</button>}>
        {/* Stats display */}
        {/* Filter buttons */}
        {/* Data table or list */}
      </Card>
      {showModal && <FeatureModal ... />}
    </div>
  );
};
```

### Modal Component Pattern
```javascript
const FeatureModal = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState(item);
  
  return (
    <Modal title="..." onClose={onClose} onSave={() => onSave(formData)}>
      <FormField label="Name" value={formData.name} 
        onChange={e => setFormData({...formData, name: e.target.value})} />
      {/* More form fields */}
    </Modal>
  );
};
```

## 🔧 Common Operations

### Adding a New Feature

1. **Create component file**: `components/my-feature-components.js`
```javascript
const MyFeature = ({ myData, updateData }) => {
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
    = useCRUD(myData, updateData, 'myData', validator);
  
  return (
    <Card title="My Feature" action={<button onClick={() => handleAdd({...})}>Add</button>}>
      {/* Feature content */}
    </Card>
  );
};
```

2. **Add to index.html** (before app.js):
```html
<script defer type="text/babel" src="/components/my-feature-components.js"></script>
```

3. **Add to DEFAULT_DATA** in utils.js:
```javascript
const DEFAULT_DATA = {
  // ... existing fields
  myData: []
};
```

4. **Add tab** in tabs-component.js:
```javascript
{ id: 'myfeature', label: '🎯 My Feature', group: 'planning' }
```

5. **Add route** in app.js:
```javascript
{activeTab === 'myfeature' && <MyFeature myData={data.myData} updateData={updateData} />}
```

### Using Notifications in Components

1. **Pass showNotification from app.js**:
```javascript
<MyComponent data={data} updateData={updateData} showNotification={showNotification} />
```

2. **Use in component**:
```javascript
const MyComponent = ({ data, updateData, showNotification }) => {
  const handleSuccess = () => {
    showNotification('Operation successful!', 'success');
  };
  // ...
};
```

## 🎯 Key Features Explained

### Guest Management
- **Single vs Family**: Family type has `familyMembers` array
- **Family Members**: Each has own dietary, room, dates, aadhar status
- **RSVP**: yes/pending/no status
- **Dietary Preferences**: Veg and Jain options only (non-veg removed)
- **Custom Fields**: Categories, relations, dietary preferences are customizable
- **Stats**: Calculates total individuals (head + family members)
- **Enhanced Table**: Improved fonts (13-14px), better column ordering (Phone/Room before Notes)

### Vendor Management
- **40+ Types**: Pre-defined vendor types for North Indian weddings
- **Custom Types**: Can add new types, saved to `customVendorTypes`
- **Availability**: Array of slots with from/to dates and times
- **Costs**: Estimated, final, and advance paid tracking

### Budget Management
- **12 Categories**: Pre-defined budget categories
- **Subcategories**: Each category can have subcategories
- **Planned vs Actual**: Track both estimated and actual spending
- **Progress**: Visual progress bars and percentage calculations

### Task Management
- **Categories**: vendor, preparation, shopping, transport, decoration, catering
- **Templates**: Pre-built task templates for common wedding tasks
- **Priority**: low/medium/high with color coding
- **Overdue**: Automatic detection of overdue tasks

### Rituals & Customs
- **Pre-Wedding**: Roka, Sagan, Mehendi, Sangeet, Haldi, etc.
- **Main Ceremonies**: Baraat, Milni, Pheras, Vidai, Reception, etc.
- **Ritual Items**: Track items needed for each ceremony
- **Completion**: Mark ceremonies as completed

## 🚨 Common Pitfalls & Solutions

### Script Loading Order
**Problem**: Component uses undefined function/component
**Solution**: Check index.html - dependencies must load before dependents
- shared-components-bundle.js MUST load before feature components
- notification-component.js MUST load before app.js
- app.js MUST load last

### Notification Showing Twice
**Problem**: Notification stutters or shows multiple times
**Solution**: Use `useRef` for timer management, empty dependency array in useEffect
- Prevents multiple timer creation
- Ensures single notification display
- Fixed in notification-component.js

### State Updates Not Saving
**Problem**: UI updates but data doesn't persist
**Solution**: Ensure `updateData(key, value)` is called with correct key
- Key must match DEFAULT_DATA structure
- Value must be complete array/object, not partial

### Skip Link Visible
**Problem**: Skip link partially visible at top
**Solution**: Use `top: -100px` and `transform: translateY(-100%)` in accessibility.css
- Completely hides link off-screen
- Shows on focus for keyboard users

## 📚 Version History

### v2.2.0 (2024) - UX & Dietary Update
- Simplified dietary preferences to Veg and Jain only
- Added reusable notification system with auto-dismiss
- Improved guest table fonts and column ordering
- Fixed skip link positioning for accessibility
- Enhanced notification component with useRef for stability

### v2.1.0 (2024) - Stability & Validation Update
- Fixed service worker cache URLs for proper offline functionality
- Enhanced all validators with comprehensive error handling
- Added division-by-zero guards in dashboard calculations
- Improved async storage operations

### v2.0.0 (2024) - Security & Accessibility Update
- Added input sanitization and data encryption
- Added Content Security Policy
- Added keyboard navigation and screen reader support
- Added WCAG 2.1 AA compliance

### v1.0.0 - Initial Release
- Core wedding planning features
- PWA with offline support
- LocalStorage persistence

---

**This document provides comprehensive context for AI assistants and developers working with this codebase.**
