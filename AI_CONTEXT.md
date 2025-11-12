# AI Context Document - Wedding Planner App

This document provides comprehensive context for AI assistants (LLMs) to understand and work with this codebase effectively.

## 🎯 Project Purpose

A Progressive Web App for planning North Indian weddings with comprehensive features for guest management, vendor coordination, budget tracking, ritual planning, and more. Built with React 18 via CDN, runs entirely in browser with localStorage and optional Neon Postgres sync.

## 🏗️ Architecture Overview

### Technology Stack
- **React 18.2.0** - Loaded via CDN (production build)
- **Babel Standalone 7.23.2** - JSX transpilation in browser
- **No Build System** - Direct script loading, no webpack/vite
- **Storage**: LocalStorage (primary) + Neon Postgres (optional)
- **PWA**: Service Worker for offline capability

### Critical Design Decisions

1. **No Build Step**: All React code uses `type="text/babel"` and transpiles in browser
2. **Script Order Matters**: Dependencies must load before dependents (see index.html)
3. **Global State**: Single data object passed down via props (no Redux/Context)
4. **Auto-save**: Every data change triggers save to localStorage and database
5. **Dual Storage**: LocalStorage for immediate persistence, Postgres for cloud sync

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

**db.js**
- `DatabaseManager` singleton class
- Neon Postgres integration via HTTP API
- Fallback to localStorage on failure
- Optional - app works without database

**styles.css**
- CSS variables for theming
- Responsive grid layouts
- Component-specific styles
- No CSS-in-JS

### Component Files

**components/shared-components-bundle.js** (MUST LOAD FIRST)
- Shared UI components used by all features
- Custom hooks for common patterns
- North Indian wedding constants
- Components: `Modal`, `FormField`, `Badge`, `Card`, `ActionButtons`, `SelectOrAddField`, etc.
- Hooks: `useCRUD`, `useFilter`, `useWeddingProgress`

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

**components/dashboard-component.js**
- `Dashboard` component
- Real-time statistics and analytics
- Alert system for critical items
- Progress tracking for all features
- Smart insights and recommendations

**Feature Components** (guest, vendor, budget, task, menu, ritual, gift, shopping, travel, setting)
- Each manages one feature area
- Follows consistent pattern: list view + modal for add/edit
- Uses `useCRUD` hook for common operations
- Props: `{data, updateData}` or specific data slice

## 🔄 Data Flow

### Data Structure
```javascript
{
  weddingInfo: { brideName, groomName, weddingDate, location, totalBudget },
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
5. Save goes to both localStorage and database

### CRUD Pattern (via useCRUD hook)
```javascript
const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
  = useCRUD(items, updateData, 'dataKey', validator);

// handleAdd - Opens modal with new item template
// handleEdit - Opens modal with existing item
// handleSave - Validates, updates array, calls updateData
// handleDelete - Confirms, removes from array, calls updateData
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

### Modifying Existing Feature

1. **Find component file** in `components/` directory
2. **Locate data structure** in `utils.js` DEFAULT_DATA
3. **Update component** - maintain existing patterns
4. **Test data flow** - ensure updateData is called correctly
5. **Check validation** - update validator if needed

### Adding Shared Component

1. **Add to shared-components-bundle.js**
2. **Export as global** (no export statement needed, just define)
3. **Use in any component** (available globally after bundle loads)

## 🎯 Key Features Explained

### Guest Management
- **Single vs Family**: Family type has `familyMembers` array
- **Family Members**: Each has own dietary, room, dates, aadhar status
- **RSVP**: yes/pending/no status
- **Custom Fields**: Categories, relations, dietary preferences are customizable
- **Stats**: Calculates total individuals (head + family members)

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
- app.js MUST load last

### State Updates Not Saving
**Problem**: UI updates but data doesn't persist
**Solution**: Ensure `updateData(key, value)` is called with correct key
- Key must match DEFAULT_DATA structure
- Value must be complete array/object, not partial

### Modal Not Closing
**Problem**: Modal stays open after save
**Solution**: Ensure `closeModal()` is called in handleSave or onSave callback

### Validation Errors
**Problem**: Can't save item even though fields are filled
**Solution**: Check validator function - ensure all required fields are validated
- Validator returns `null` for valid, `{field: 'error'}` for invalid

### Custom Values Not Persisting
**Problem**: Custom categories/relations disappear on reload
**Solution**: Ensure custom values are added to saved arrays and updateData is called
- Example: `updateData('savedGuestCategories', [...existing, newValue])`

## 🔍 Debugging Tips

### Check Data Structure
```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('weddingPlannerData'));
console.log(data);
```

### Verify Script Loading
```javascript
// In browser console
console.log(typeof Modal); // Should be 'function'
console.log(typeof useCRUD); // Should be 'function'
```

### Check Save Operations
```javascript
// In browser console
window.storageManager.loadData(); // Returns current data
```

### Monitor State Changes
- Open React DevTools
- Watch component re-renders
- Check props being passed

## 📝 Code Style Guidelines

### Naming Conventions
- Components: PascalCase (`GuestModal`)
- Functions: camelCase (`handleSave`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_DATA`)
- CSS classes: kebab-case (`modal-overlay`)

### Component Structure
1. Imports/hooks at top
2. State declarations
3. Computed values (useMemo)
4. Event handlers
5. Return JSX

### JSX Patterns
- Use semantic HTML
- Inline styles for dynamic values
- CSS classes for static styles
- Conditional rendering with `&&` or ternary

### Data Immutability
- Always create new arrays/objects
- Use spread operator: `[...array, newItem]`
- Never mutate props directly

## 🎓 Learning Resources

### Understanding the Codebase
1. Start with `app.js` - understand data flow
2. Read `utils.js` - understand data structure
3. Study `shared-components-bundle.js` - understand patterns
4. Pick one feature component - see pattern in action
5. Try modifying a feature - apply pattern

### React Patterns Used
- Functional components with hooks
- Props drilling (no Context API)
- Controlled components (forms)
- Conditional rendering
- List rendering with keys

### North Indian Wedding Context
- Pre-wedding ceremonies (Mehendi, Sangeet, Haldi)
- Main ceremonies (Baraat, Pheras, Vidai)
- Family relations (Mama, Chacha, Bua, etc.)
- Vendor types (Pandit, Band Baja, Dhol, etc.)

## 🚀 Performance Considerations

### Optimization Strategies
- `useMemo` for expensive calculations
- Avoid inline function definitions in render
- Use `defer` for script loading
- Service Worker for caching

### Data Size Management
- LocalStorage limit: ~5-10MB
- Export data regularly for backup
- Consider pagination for large lists (future enhancement)

### Rendering Performance
- React production build via CDN
- Minimal re-renders (props comparison)
- Efficient list rendering with keys

## 🔐 Security Considerations

### Data Privacy
- All data stored locally in browser
- No external API calls (except optional database)
- No tracking or analytics
- User controls all data

### Database Security
- Optional Neon Postgres uses HTTPS
- Credentials in env.js (not committed)
- Basic auth with username/password
- Fallback to localStorage on failure

## 📦 Deployment

### Static Hosting
- Any static file server works
- No server-side processing needed
- HTTPS recommended for PWA

### PWA Requirements
- HTTPS or localhost
- manifest.json accessible
- Service worker registered
- Icons in correct sizes

### Environment Setup
- Copy `.env.example` to `env.js`
- Update with database credentials (optional)
- Serve files from root directory

## 🎯 Future Enhancement Ideas

### Potential Features
- Guest seating arrangements
- Invitation tracking
- Photo gallery
- Expense splitting
- Vendor reviews
- Timeline reminders
- WhatsApp integration
- PDF export for printing

### Technical Improvements
- TypeScript for type safety
- Build system for optimization
- State management library
- API backend
- Real-time collaboration
- Mobile app (React Native)

## 📞 Getting Help

### When Asking for Help
1. Specify which component/file
2. Describe expected vs actual behavior
3. Share relevant code snippet
4. Mention any console errors
5. Describe what you've tried

### Common Questions
**Q: How do I add a new field to guests?**
A: Update DEFAULT_DATA in utils.js, add to GuestModal form, update table display

**Q: How do I change the color scheme?**
A: Edit CSS variables in styles.css (--color-primary, etc.)

**Q: How do I add a new vendor type?**
A: Use "Add New" in vendor modal, or add to defaultVendorTypes array

**Q: How do I export data programmatically?**
A: Use `window.storageManager.loadData()` to get data object

---

**This document should be provided to AI assistants when working with this codebase for optimal understanding and code generation.**
