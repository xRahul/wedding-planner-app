# AI Context: Wedding Planner App

**A comprehensive technical reference for AI assistants. This document contains all critical patterns, data structures, and implementation details for efficient code generation and modification.**

---

## 1. 🚀 Core Principles & Constraints

**These are the most important rules. Do not violate them.**

*   **🚫 NO BUILD SYSTEM**: This is a browser-first PWA. It runs without a build system (no webpack/vite/npm build).
    *   React 18.2.0 and Babel 7.23.2 are loaded via CDN.
    *   All scripts use `<script type="text/babel">` for in-browser JSX transpilation.
*   **💾 State Management**: A single JSON-like object (`data`) in `app.js` is the entire app state.
    *   It's persisted to `localStorage` via `window.storageManager`.
    *   State updates **must** use the `updateData(key, value)` function passed down from `app.js`. This function handles state changes and triggers auto-save.
    *   Always update a top-level key from `DEFAULT_DATA` (e.g., `guests`, `vendors`, `budget`).
*   **🔒 Security is Mandatory**:
    *   All user input must be sanitized via `window.securityUtils.sanitizeInput()` or `sanitizeObject()` from `utils/security.js` before storing or rendering.
    *   Encrypt sensitive fields (phone, aadhar, email) using `window.securityUtils.encryptText()` and decrypt with `decryptText()`. The `encryptGuestData` and `decryptGuestData` helpers are available for guest objects.
*   **📜 Script Load Order is CRITICAL**: The order in `index.html` is fundamental to the app's operation. Do not change it without a very specific reason and migration plan. `app.js` must always be last. See `index.html` for the exact order.

---

## 2. 🗺️ Where to Find What: Key Files

*   **Main Application Logic**: `app.js` (state management, routing, component composition).
*   **Core Data Structures & Utilities**: `utils.js` (contains `DEFAULT_DATA`, validators, formatters).
*   **Storage Interface**: `storage.js` (defines `window.storageManager` for `localStorage` access).
*   **Security Functions**: `utils/security.js` (defines `window.securityUtils` for sanitization, encryption, validation).
*   **Shared UI & Hooks**: `components/shared-components-bundle.js` (contains reusable components like `Modal`, `FormField`, and hooks like `useCRUD`, `useFilter`). **Always reuse these.**
*   **PWA Logic**: `pwa.js` (registers service worker), `service-worker.js` (caching strategy), `manifest.json`.

---

## 3. 📝 Common Tasks & Procedures

### Adding a New Feature Component

1.  **Create File**: Create `components/my-feature-components.js`. Use the standard component pattern with the `useCRUD` hook.
2.  **Add to `index.html`**: Add `<script defer type="text/babel" src="/components/my-feature-components.js"></script>` **after** `shared-components-bundle.js` and **before** `app.js`.
3.  **Update Data Structure**: If a new top-level data key is needed, add it to `DEFAULT_DATA` in `utils.js`.
4.  **Add Validator**: If needed, add a validation function in `utils.js` and pass it to the `useCRUD` hook.
5.  **Add Tab**: Add a new tab object to the `TABS` array in `components/tabs-component.js`.
6.  **Add to `app.js`**: Conditionally render your new component in `app.js` based on `activeTab`.

### Reading and Updating Data

*   **Always use `updateData('key', newArrayOrObject)` to persist changes.** This is passed as a prop from `app.js`.
*   The `updateData` function in `app.js` automatically handles saving the entire data object to `localStorage`.
*   Directly calling `window.storageManager.saveData()` should be avoided unless for bulk operations outside the standard component flow.

---

## 4. 🧱 Patterns & Conventions

### Standard Component Pattern

```javascript
// In components/feature-components.js
const FeatureName = ({ data, updateData }) => {
  // 1. CRUD hook for modal and data operations
  const { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal }
    = useCRUD(data, updateData, 'dataKey', validatorFn);

  // 2. Render UI
  return (
    <Card title="Feature" action={<button onClick={() => handleAdd({...template})}>Add</button>}>
      {/* ... list/table of items ... */}
    </Card>
    {showModal && (
      <FeatureModal
        item={editing}
        onSave={handleSave}
        onClose={closeModal}
      />
    )}
  );
};
```

### Shared Components & Hooks (from `shared-components-bundle.js`)

**MUST USE THESE. DO NOT RECREATE.**

*   **UI Components**: `Modal`, `FormField`, `Badge`, `ProgressRing`, `QuickStats`, `EmptyState`, `Card`, `ActionButtons`, `SelectOrAddField`.
*   **Hooks**:
    *   `useCRUD(items, updateData, 'dataKey', validatorFn)`: Manages modal state and CRUD logic.
    *   `useFilter(items, filterFn)`: Manages client-side filtering.
    *   `useNotification()`: Provides `showNotification` function to display toast-like messages.

### Domain Rules

*   **Dietary Options**: Values are strictly `"veg"` or `"jain"`. No `"non-veg"`.
*   **Payment Fields**: `paymentResponsibility` must be one of `"bride"|"groom"|"split"`. `paidBy` can also be `"pending"`.
*   **Guest Types**: `type` is `"single"` or `"family"`. Family entries have a `familyMembers` array. Guest counts must iterate through this array.

---

## 5. 🧬 Complete Data Structure

This is the shape of the main `data` object, defined as `DEFAULT_DATA` in `utils.js`.

```javascript
{
  weddingInfo: { /* ... */ },
  savedGuestCategories: [],
  // ... (the full structure from the original file)
  guests: [
    {
      id, type: 'single'|'family', name, category, side: 'bride'|'groom',
      // ... guest fields
      familyMembers: [
        { id, name, /* ... member fields */ }
      ]
    }
  ],
  vendors: [ /* ... */ ],
  budget: [ /* ... */ ],
  tasks: [ /* ... */ ],
  // ... other top-level keys
}
```
*(The full data structure is omitted here for brevity but should be referenced from `utils.js`)*

---

## 6. 💡 Common Pitfalls & How to Avoid Them

1.  **Script Order Errors**: Double-check `index.html` script order. `shared-components-bundle.js` before features, `app.js` last.
2.  **State Not Saving**: Ensure you are calling `updateData` with the correct top-level key.
3.  **Validation Errors**: Validators in `utils.js` should return an `errors` object or `null`, not throw exceptions.
4.  **Division by Zero**: When calculating stats (e.g., percentages), always check for a non-zero denominator.
5.  **Guest Counts**: Remember to iterate through `familyMembers` arrays when calculating total guest counts, dietary needs, etc.