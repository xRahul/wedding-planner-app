# AI Context Document - Wedding Planner App

COMPREHENSIVE TECHNICAL REFERENCE FOR AI ASSISTANTS - All critical patterns, data structures, and implementation details for efficient code generation and modification.

## CRITICAL ARCHITECTURE RULES

**NO BUILD SYSTEM**: React 18.2.0 + Babel 7.23.2 via CDN. All scripts use `type="text/babel"` for in-browser JSX transpilation. NO webpack/vite/npm build.

**SCRIPT LOAD ORDER IS CRITICAL** (index.html):
1. security.js (global window.securityUtils)
2. error-boundary.js (ErrorBoundary component)
3. storage.js (global window.storageManager)
4. utils.js (DEFAULT_DATA, validators, formatters)
5. shared-components-bundle.js (ALL shared components/hooks - MUST load before features)
6. header-component.js
7. tabs-component.js
8. analytics-dashboard-components.js
9. dashboard-component.js
10. ALL feature components (timeline, guest, vendor, budget, task, menu, gift, ritual, shopping, travel, setting)
11. notification-component.js (Notification component + useNotification hook)
12. app.js (MUST BE LAST - main WeddingPlannerApp component)
13. pwa.js (service worker registration)

**STATE MANAGEMENT**: Single data object in app.js, passed via props. NO Redux/Context. updateData(key, value) function passed to all components.

**AUTO-SAVE**: Every data change triggers saveData() to localStorage via useEffect in app.js.

## COMPLETE DATA STRUCTURE (DEFAULT_DATA in utils.js)

```javascript
{
  weddingInfo: {
    brideName: "",
    groomName: "",
    weddingDate: "",
    location: "",
    totalBudget: 0
  },
  savedGuestCategories: ['family', 'friends', 'relatives', 'family_friends', 'colleagues', 'vendors'],
  savedGuestRelations: ['maternal_uncle', 'maternal_aunt', 'paternal_uncle', 'paternal_aunt', 'father_sister', 'mother_sister', 'cousin', 'family_friend', 'college_friend', 'work_colleague', 'neighbor'],
  savedDietaryPreferences: ['veg', 'jain'], // ONLY veg and jain, no non-veg
  savedFamilyRelations: ['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter'],
  customCeremonies: [],
  customGiftEvents: [],
  customVendorTypes: [],
  timeline: [
    { id, ceremony, date, time, location, dayOffset, notes }
  ],
  guests: [
    {
      id, type: 'single'|'family', name, category, side: 'bride'|'groom', relation,
      phone, dietary: 'veg'|'jain', rsvpStatus: 'yes'|'pending'|'no',
      aadharCollected: bool, room, arrivalDate, departureDate, notes,
      giftGiven: bool, giftAmount: number, giftDescription,
      ceremonyParticipation: [], specialNeeds, transportNeeded: bool,
      familyMembers: [
        { id, name, familyRelation, phone, room, arrivalDate, departureDate, dietary, aadharCollected, transportNeeded }
      ]
    }
  ],
  vendors: [
    {
      id, type, name, contact, email, estimatedCost, finalCost, status: 'pending'|'booked'|'confirmed'|'cancelled',
      availability: [{ from, fromTime, to, toTime }], bookedDate, notes,
      advancePaid, paymentStatus, rating, reviews, budgetCategory
    }
  ],
  budget: [
    { category: 'venue'|'catering'|'decor'|'bride'|'groom'|'pandit_and_rituals'|'entertainment'|'photography'|'invitations'|'gifts'|'transport'|'other', planned: 0, actual: 0, subcategories: [] }
  ],
  tasks: [
    { id, description, deadline, assignedTo, status: 'pending'|'done', priority: 'low'|'medium'|'high', category: 'vendor'|'preparation'|'shopping'|'transport'|'decoration'|'catering'|'general' }
  ],
  menus: [
    { id, eventName, guestCount, budgetCategory, items: [{ name, cost, budgetCategory }], vegCount, jainCount }
  ],
  travel: {
    transport: [
      { id, vehicleType, fromDate, toDate, seats, route, totalPrice, budgetCategory, notes }
    ]
  },
  ritualsAndCustoms: {
    preWedding: [{ id, name, date, time, location, completed, items: [], notes }],
    mainCeremonies: [{ id, name, date, time, location, completed, items: [], notes }],
    customs: [{ id, name, description, completed }]
  },
  giftsAndFavors: {
    familyGifts: [{ id, recipientName, ceremony, giftItem, estimatedCost, actualCost, budgetCategory, status: 'purchased'|'pending' }],
    returnGifts: [{ id, giftItem, quantity, costPerItem, totalCost, budgetCategory, status }],
    specialGifts: [{ id, recipientName, occasion, giftItem, cost, budgetCategory, status }]
  },
  shopping: {
    bride: [{ event, items: [{ id, item, purchased, estimatedCost, actualCost, budgetCategory }] }],
    groom: [{ event, items: [{ id, item, purchased, estimatedCost, actualCost, budgetCategory }] }],
    family: [{ for, items: [{ id, item, purchased, estimatedCost, actualCost, budgetCategory }] }]
  },
  traditions: {
    preWedding: [{ id, name, description, date, completed }],
    ritual_items: [{ id, itemName, quantity, purpose, obtained }]
  }
}
```

## SHARED COMPONENTS (shared-components-bundle.js)

**MUST USE THESE - DO NOT RECREATE**

### UI Components
```javascript
<Modal title="..." onClose={fn} onSave={fn} saveLabel="Save" saveDisabled={bool}>{children}</Modal>
<FormField label="Name" type="text|textarea|select" value={val} onChange={fn} error={str} required={bool} placeholder={str} />
<Badge status="yes|no|pending|confirmed|done|purchased|completed|high|medium|low">{children}</Badge>
<ProgressRing percentage={num} size={60} strokeWidth={4} color="var(--color-primary)" />
<QuickStats stats={[{value, label, color}]} />
<EmptyState icon="👥" message="No data" description="Optional" />
<Card title="Title" action={<button>...</button>}>{children}</Card>
<ActionButtons onEdit={fn} onDelete={fn} />
<SelectOrAddField label="Category" value={val} onChange={fn} options={arr} placeholder="Enter..." />
```

### Hooks
```javascript
// CRUD operations - saves ~60 lines per component
const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
  = useCRUD(items, updateData, 'dataKey', validatorFn);

// Filter logic - saves ~10 lines
const [filtered, filter, setFilter] = useFilter(items, (item, filterValue) => item.field === filterValue);

// Wedding progress metrics
const { tasks, guests, vendors } = useWeddingProgress(data);
// Returns: { completed, total, percentage } for each

// Notification management
const { notification, showNotification, closeNotification } = useNotification();
// showNotification(message, 'success'|'info')
```

### Constants
```javascript
NORTH_INDIAN_RELATIONS = ['father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'cousin', 'grandfather', 'grandmother', 'nephew', 'niece', 'son_in_law', 'daughter_in_law', 'mama', 'mami', 'chacha', 'chachi', 'tau', 'tayi', 'bua', 'fufa', 'nana', 'nani', 'dada', 'dadi', 'jija', 'saala', 'saali', 'devar', 'jethani']

NORTH_INDIAN_CEREMONIES = ['Roka', 'Sagan', 'Tilak', 'Ring Ceremony', 'Mehendi', 'Sangeet', 'Haldi', 'Ganesh Puja', 'Kalash Sthapna', 'Mandap Muhurat', 'Baraat', 'Milni', 'Jaimala', 'Kanyadaan', 'Pheras', 'Sindoor', 'Vidai', 'Reception', 'Grih Pravesh', 'Pag Phera', 'Mooh Dikhai']
```

## UTILITY FUNCTIONS (utils.js)

```javascript
// Data persistence
loadData() // async, returns data object or DEFAULT_DATA
saveData(data) // async, saves to localStorage

// Validation (return errors object or null)
validateGuest(guest) // checks name, category, side, relation, phone, email, giftAmount
validateVendor(vendor) // checks name, type, email, phone, costs
validateTimelineEvent(event) // checks ceremony, date
validateMenuItem(item) // checks name, cost
validateTravelItem(item) // checks vehicleType, dates, seats, price
validateWeddingInfo(info) // checks brideName, groomName
isValidDate(dateString) // returns bool

// Formatters
generateId() // returns 'id_timestamp_random'
formatDate(dateString, withTime=false) // returns formatted date string
formatCurrency(amount) // returns '₹X,XXX'
getDayLabel(offset) // returns "X days before/after" or "Wedding Day"
isDatePassed(dateString) // returns bool
```

## SECURITY UTILITIES (window.securityUtils)

```javascript
sanitizeInput(str) // XSS prevention
sanitizeObject(obj) // recursive sanitization
encryptText(text) // AES-GCM 256-bit encryption
decryptText(encryptedText) // decryption
encryptGuestData(guest) // encrypts phone, aadhar, email
decryptGuestData(guest) // decrypts sensitive fields
isValidPhone(phone) // validates phone format
isValidEmail(email) // validates email format
isValidName(name) // validates name (letters, spaces, hyphens, apostrophes, max 100 chars)
isValidNumber(value) // validates numeric input
```

## STORAGE MANAGER (window.storageManager)

```javascript
// Singleton instance available globally
window.storageManager.saveData(data) // async, saves to localStorage
window.storageManager.loadData() // async, loads from localStorage
window.storageManager.clearAllData() // async, clears all data
window.storageManager.addChangeListener(fn) // listen to data changes
window.storageManager.removeChangeListener(fn)
```

## NOTIFICATION SYSTEM

**In app.js:**
```javascript
const { notification, showNotification, closeNotification } = useNotification();

// Pass showNotification to components that need it
<Settings showNotification={showNotification} ... />

// Render notification
{notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
```

**In components:**
```javascript
const MyComponent = ({ data, updateData, showNotification }) => {
  const handleSuccess = () => {
    showNotification('Operation successful!', 'success'); // or 'info'
  };
  // ...
};
```

## STANDARD COMPONENT PATTERN

```javascript
const FeatureName = ({ data, updateData }) => {
  // 1. CRUD hook
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
    = useCRUD(data, updateData, 'dataKey', validatorFn);
  
  // 2. Filter hook (optional)
  const [filtered, filter, setFilter] = useFilter(data, (item, f) => item.field === f);
  
  // 3. Stats calculation (useMemo)
  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(d => d.status === 'done').length;
    return { total, completed, percentage: total > 0 ? (completed/total)*100 : 0 };
  }, [data]);
  
  // 4. Render
  return (
    <div>
      <Card title="Feature" action={<button onClick={() => handleAdd({...template})}>Add</button>}>
        <QuickStats stats={[{value: stats.total, label: 'Total'}]} />
        {/* Filter buttons */}
        {/* Data table/list */}
      </Card>
      {showModal && <FeatureModal item={editing} onSave={handleSave} onClose={closeModal} />}
    </div>
  );
};

const FeatureModal = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState(item);
  
  return (
    <Modal title="..." onClose={onClose} onSave={() => onSave(formData)}>
      <FormField label="Name" value={formData.name} 
        onChange={e => setFormData({...formData, name: e.target.value})} />
    </Modal>
  );
};
```

## GUEST COMPONENT SPECIFICS

**Guest Type**: 'single' or 'family'
- Single: One person with all fields
- Family: Head person + familyMembers array (each member has: id, name, familyRelation, phone, room, arrivalDate, departureDate, dietary, aadharCollected, transportNeeded)

**Stats Calculation**:
- totalIndividuals = sum of (1 + familyMembers.length) for families, 1 for singles
- confirmedIndividuals = same calculation but only for rsvpStatus === 'yes'
- vegCount/jainCount = count dietary preferences including family members
- aadharCollected/roomsAssigned = count including family members
- transportNeeded = count including family members

**Table Display**: Shows head + nested rows for family members with smaller font (12px) and secondary color

**Custom Fields**: savedGuestCategories, savedGuestRelations, savedDietaryPreferences, savedFamilyRelations - all managed via SelectOrAddField

## BUDGET CATEGORY SUPPORT

**Components with Budget Category**: Vendors, Menus (events + items), Gifts (all types), Shopping (all items), Travel

**Budget Category Field**: Optional dropdown in modals, displays as badge in tables

**Budget Categories**: venue, catering, decor, bride, groom, pandit_and_rituals, entertainment, photography, invitations, gifts, transport, other

**Implementation Pattern**:
```javascript
const budgetCategories = budget?.map(b => ({
  value: b.category,
  label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})) || [];

// In modal
<select className="form-select" value={formData.budgetCategory || ''} onChange={e => setFormData({ ...formData, budgetCategory: e.target.value })}>
  <option value="">Select category (optional)</option>
  {budgetCategories.map(cat => (
    <option key={cat.value} value={cat.value}>{cat.label}</option>
  ))}
</select>

// In table
{item.budgetCategory ? (
  <span className="badge badge-info">{item.budgetCategory.replace(/_/g, ' ')}</span>
) : '-'}
```

## VENDOR COMPONENT SPECIFICS

**40+ Default Vendor Types**: pandit_ji, decorator, caterer, dj, photographer, videographer, florist, mehendi_artist, makeup_artist, choreographer, band_baja, dhol_players, light_setup, wedding_planner, invitation_cards, transport, tent_house, sound_system, fireworks, stage_setup, varmala_setup, luxury_car_rental, astrologer, priest_assistant, havan_materials, mandap_decorator, horse_ghodi, baggi_decoration, sehra_bandi, kalash_decoration, coconut_supplier, paan_counter, live_counter_chef, ice_cream_counter, security_service, valet_parking, generator_rental, ac_cooler_rental, crockery_cutlery, linen_rental

**Custom Vendor Types**: Saved to data.customVendorTypes array, persisted globally

**Availability Slots**: Array of {from, fromTime, to, toTime} objects

**Cost Tracking**: estimatedCost, finalCost, advancePaid

**Budget Category**: Links to budget.category for tracking

## TASK COMPONENT SPECIFICS

**Categories**: vendor, preparation, shopping, transport, decoration, catering, general

**Wedding Templates**: Pre-built tasks for North Indian weddings:
- Book Pandit Ji for ceremonies (vendor, high)
- Finalize Mehendi artist (vendor, high)
- Order wedding cards (preparation, medium)
- Book band baja for baraat (vendor, high)
- Arrange horse/ghodi for groom (transport, medium)
- Buy ritual items (kalash, coconut, etc.) (shopping, high)
- Finalize mandap decoration (decoration, medium)
- Confirm catering menu (catering, high)

**Toggle Status**: Checkbox in table toggles between 'pending' and 'done'

**Overdue Detection**: status === 'pending' && deadline && new Date(deadline) < new Date()

## BUDGET COMPONENT SPECIFICS

**12 Categories**: venue, catering, decor, bride, groom, pandit_and_rituals, entertainment, photography, invitations, gifts, transport, other

**Subcategories**: Each category has subcategories array with {name, planned, actual}

**Progress Calculation**: (actual / planned) * 100 for each category

**Total Budget**: From weddingInfo.totalBudget

**Budget Health**: totalActual vs totalBudget comparison

## APP.JS STRUCTURE

```javascript
const WeddingPlannerApp = () => {
  const [data, setData] = useState(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notification, showNotification, closeNotification } = useNotification();

  // Load data on mount
  useEffect(() => { /* loadData() */ }, []);

  // Save data on every change
  useEffect(() => { /* saveData(data) */ }, [data, loading]);

  const updateData = (key, value) => {
    setData({ ...data, [key]: value });
  };

  return (
    <div>
      <Header weddingInfo={data.weddingInfo} />
      {error && <div className="error-banner">...</div>}
      {notification && <Notification ... />}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <main id="main-content" className="container">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'timeline' && <Timeline timeline={data.timeline} updateData={updateData} weddingDate={data.weddingInfo.weddingDate} />}
        {activeTab === 'guests' && <Guests guests={data.guests} updateData={updateData} data={data} />}
        {activeTab === 'vendors' && <Vendors vendors={data.vendors} updateData={updateData} budget={data.budget} />}
        {activeTab === 'budget' && <Budget budget={data.budget} updateData={updateData} totalBudget={data.weddingInfo.totalBudget} />}
        {activeTab === 'tasks' && <Tasks tasks={data.tasks} updateData={updateData} />}
        {activeTab === 'menus' && <Menus menus={data.menus} updateData={updateData} />}
        {activeTab === 'shopping' && <Shopping shopping={data.shopping} updateData={updateData} />}
        {activeTab === 'rituals' && <Rituals ritualsAndCustoms={data.ritualsAndCustoms} traditions={data.traditions} updateData={updateData} />}
        {activeTab === 'gifts' && <Gifts giftsAndFavors={data.giftsAndFavors} updateData={updateData} />}
        {activeTab === 'travel' && <Travel travel={data.travel} updateData={updateData} />}
        {activeTab === 'settings' && <Settings weddingInfo={data.weddingInfo} updateData={updateData} allData={data} setData={setData} showNotification={showNotification} />}
      </main>
    </div>
  );
};
```

## ADDING NEW FEATURE - COMPLETE STEPS

1. **Create component file**: `components/my-feature-components.js`
```javascript
const MyFeature = ({ myData, updateData }) => {
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal } 
    = useCRUD(myData, updateData, 'myData', validator);
  
  return (
    <Card title="My Feature" action={<button onClick={() => handleAdd({id: generateId(), ...})}>Add</button>}>
      {/* content */}
    </Card>
  );
};
```

2. **Add to index.html** (BEFORE app.js, AFTER shared-components-bundle.js):
```html
<script defer type="text/babel" src="/components/my-feature-components.js"></script>
```

3. **Add to DEFAULT_DATA** in utils.js:
```javascript
const DEFAULT_DATA = {
  // ... existing
  myData: []
};
```

4. **Add validator** in utils.js (if needed):
```javascript
const validateMyData = (item) => {
  const errors = {};
  if (!item.name?.trim()) errors.name = 'Name required';
  return Object.keys(errors).length ? errors : null;
};
```

5. **Add tab** in tabs-component.js:
```javascript
{ id: 'myfeature', label: '🎯 My Feature', group: 'planning' }
```

6. **Add route** in app.js:
```javascript
{activeTab === 'myfeature' && <MyFeature myData={data.myData} updateData={updateData} />}
```

## CSS CLASSES REFERENCE

**Layout**: container, card, card-title, flex-between, stats-grid, stat-card, stat-value, stat-label, quick-stats, quick-stat, quick-stat-value, quick-stat-label

**Forms**: form-group, form-label, form-input, form-select, form-textarea, error-message

**Buttons**: btn, btn-primary, btn-outline, btn-danger, btn-small

**Tables**: table-container, table

**Badges**: badge, badge-success, badge-error, badge-warning, badge-info, badge-small

**Modals**: modal-overlay, modal, modal-header, modal-title, modal-close, modal-body, modal-footer

**Notifications**: notification-banner, notification-success, notification-info

**Progress**: progress-bar, progress-fill

**Empty State**: empty-state, empty-state-icon

**Accessibility**: skip-link (top: -100px, transform: translateY(-100%))

## CSS VARIABLES

```css
--color-primary: #4a90e2
--color-success: #27ae60
--color-warning: #f39c12
--color-error: #e74c3c
--color-info: #3498db
--color-bg: #ffffff
--color-bg-secondary: #f8f9fa
--color-text: #2c3e50
--color-text-secondary: #7f8c8d
--color-border: #dfe6e9
```

## COMMON PITFALLS

1. **Script Order**: shared-components-bundle.js MUST load before feature components, app.js MUST be last
2. **Notification Double Render**: Use useRef for timer in notification component, empty dependency array in useEffect
3. **State Not Saving**: Always call updateData(key, value) with correct key matching DEFAULT_DATA
4. **Validation Errors**: Return errors object or null, NOT throwing exceptions
5. **Division by Zero**: Always check denominator > 0 before division in stats calculations
6. **Date Validation**: Use isValidDate() before date operations
7. **Family Members**: Remember to iterate familyMembers array for stats (dietary, aadhar, rooms, transport)
8. **Custom Fields**: Use SelectOrAddField for categories/relations/types that can be extended
9. **Modal State**: Use useCRUD hook, don't manage showModal/editing manually
10. **Dietary Preferences**: ONLY 'veg' and 'jain' - no 'non_veg' option

## PERFORMANCE OPTIMIZATIONS

- Use useMemo for expensive calculations (stats, filtered lists)
- Use useCallback for event handlers passed to child components
- Batch state updates when possible
- Avoid inline function definitions in render (use useCallback)
- Keep component files under 500 lines (split into sub-components if needed)

## ACCESSIBILITY REQUIREMENTS

- All interactive elements have aria-labels
- Skip link at top (hidden off-screen, visible on focus)
- Keyboard navigation (Tab/Shift+Tab/Enter/Escape)
- Color contrast 4.5:1 minimum
- Touch targets 44x44px minimum
- Screen reader compatible (NVDA, JAWS, VoiceOver, TalkBack)
- Reduced motion support (prefers-reduced-motion)

## TESTING CHECKLIST

- [ ] Script loads in correct order
- [ ] Data saves to localStorage on every change
- [ ] Data loads correctly on page refresh
- [ ] Validation prevents invalid data
- [ ] Modal opens/closes correctly
- [ ] CRUD operations work (add/edit/delete)
- [ ] Filters work correctly
- [ ] Stats calculate correctly (including edge cases like division by zero)
- [ ] Notifications show and auto-dismiss
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] PWA installs and works offline

## VERSION HISTORY

**v2.3.0**: Budget category support for menus (events + items), gifts (all types), shopping (all items), travel; menu item editing
**v2.2.0**: Dietary simplified to veg/jain only, notification system with auto-dismiss, guest table improvements, skip link fix
**v2.1.0**: Service worker cache fix, enhanced validators, division-by-zero guards, async storage improvements
**v2.0.0**: Security (sanitization, encryption, CSP), accessibility (WCAG 2.1 AA), keyboard navigation
**v1.0.0**: Initial release with core features

---

**USE THIS DOCUMENT AS PRIMARY REFERENCE - Contains all patterns, data structures, and implementation details needed for efficient code generation and modification.**
