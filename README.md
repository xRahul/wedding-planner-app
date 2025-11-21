# Wedding Planner App 💍

A comprehensive, offline-first Progressive Web App (PWA) to simplify planning a North Indian wedding. Manage everything from guests and vendors to budgets and rituals, all from your browser.

![App Screenshot Placeholder](https://via.placeholder.com/800x450.png?text=Wedding+Planner+App+Dashboard)

## ✨ Key Features

This app is packed with features designed specifically for the complexities of a North Indian wedding:

*   **👥 Guest Management**: Keep track of single guests and entire families, manage RSVPs, assign rooms, and even track gifts.
*   **🤝 Vendor Coordination**: Manage over 40 types of vendors, from the pandit to the DJ. Track contacts, costs, and availability in one place.
*   **💰 Smart Budgeting**: Set budgets for the bride and groom, and watch as the app automatically calculates costs from linked items like vendors and menus. Track who is responsible for payments (`bride`/`groom`/`split`).
*   **✅ Task Tracking**: Never miss a deadline with a built-in task manager. Use pre-built templates for common North Indian wedding tasks.
*   **🍽️ Menu & Ritual Planning**: Plan detailed menus for each event and keep track of all pre-wedding, main, and post-wedding ceremonies.
*   **🎁 Gifts & Shopping**: Organize shopping lists and track gifts for family and guests, with templates for common items.
*   **📊 At-a-Glance Dashboard**: A powerful dashboard gives you real-time stats on your wedding progress, including a countdown, guest confirmations, and budget health.
*   **🔒 Secure & Private**: All your data is stored securely in your browser's local storage. Sensitive information is encrypted, and nothing is sent to a server.
*   **✈️ Offline First**: As a PWA, this app works seamlessly even without an internet connection once installed.

## 🚀 Getting Started

No complex setup required!

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/xRahul/wedding-planner-app.git
    cd wedding-planner-app
    ```
2.  **Serve the files:**
    You need a simple local web server.
    ```bash
    # If you have Python 3
    python -m http.server 8000

    # Or if you have Node.js
    npx serve
    ```
3.  **Open in your browser:**
    Navigate to `http://localhost:8000`. That's it!

### PWA Installation

For the best experience, install the app on your device:
*   **On Desktop**: Look for an "Install" icon in your browser's address bar.
*   **On Mobile**: Look for an "Add to Home Screen" option in your browser's menu.

This will allow you to use the app like a native application, right from your home screen, even when you're offline.

## 💾 Data Management

*   **Export/Import**: You can back up all your data to a JSON file and import it later. This is useful for transferring data or for peace of mind. Find this in the **Settings** tab.
*   **Privacy**: Your data stays with you. It is stored in your browser's `localStorage` and is never uploaded to any server.

## 🛠️ For Developers

This project is built with React 18 and Babel, but without a traditional build step (like Webpack or Vite). All JSX is transpiled directly in the browser.

*   **Architecture**: The app is structured with a single state object in `app.js` and uses a component-based architecture.
*   **Key Files**:
    *   `index.html`: The entry point, with a **critical script loading order**.
    *   `app.js`: The main React component and state management.
    *   `components/`: Contains all the feature components.
    *   `components/shared-components-bundle.js`: Home to reusable UI components and custom hooks (`useCRUD`, `useNotification`).
    *   `utils.js`: Contains the default data structure, validators, and helper functions.
*   **Technical Reference**: For a deep dive into the architecture, data structures, and development patterns, please see [`AI_CONTEXT.md`](AI_CONTEXT.md).

## 🤝 Contributing

Contributions are welcome! If you'd like to add a feature or fix a bug, please follow the existing code patterns and component structure.

---

**Built with ❤️ for Indian Weddings**