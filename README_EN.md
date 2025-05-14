# 📱 Mobile Shop App

> Responsive single-page application (SPA) developed with Preact for browsing and purchasing mobile devices.

## 📋 Overview

This mini-application implements a mobile device store following the specific requirements of the technical challenge. The application features:

- **Main View (PLP)** - Product listing with real-time search
- **Detail View (PDP)** - Complete product information and purchase options

## ✨ Main Features

| Feature | Description |
|----------------|-------------|
| **📱 PLP** | Product Listing Page with adaptive grid design |
| **🔎 PDP** | Product Detail Page with complete specifications |
| **🔍 Search** | Real-time filtering by brand and model with debounced input |
| **🌐 Multilingual** | Full support for Spanish and English with automatic detection |
| **🛒 Cart** | Add products with color and storage selection |
| **💾 Cache** | Cache system with 1-hour expiration to reduce API calls |
| **📱 Responsive** | Design adaptable to any device |

## 🛠️ Technology Stack

- **Preact**: Lightweight React-compatible framework
- **Preact-iso**: Router for SPA implementation
- **Vite**: Fast build tool
- **RxJS**: For event management and optimized search
- **i18next**: Complete internationalization
- **Context API**: Global state management
- **Vitest**: Testing framework
- **ESLint/Prettier**: Code quality tools

## 📂 Project Structure

```
mobile-shop-app/
├── public/                 # Static assets
├── scripts/                # Build scripts and utilities
├── src/
│   ├── assets/             # Images and other static resources
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files
│   ├── context/            # React context providers
│   ├── locales/            # Translation files
│   ├── pages/              # Main page components
│   ├── services/           # API and data services
│   ├── utils/              # Utility functions
│   ├── index.jsx           # Application entry point
│   └── style.css           # Global styles
├── tests/                  # Test files
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/JvrTrvjn/mobile-shop-app.git
cd mobile-shop-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the application in development mode |
| `npm run build` | Compiles the application for production |
| `npm test` | Runs the test suite |
| `npm run lint` | Runs ESLint to check code quality |

## 🔍 Implementation Details

### 💾 Cache Strategy

The application implements a client-side caching mechanism for API responses with a 1-hour expiration period. This reduces unnecessary network requests and improves the user experience by:

- **Storing** data in localStorage with timestamps
- **Validating** expiration before making new requests
- **Updating** outdated cache entries automatically

### 🌐 Internationalization

The application supports multiple languages through:

- **Automatic detection** of language based on browser configuration
- **Language selector** available in the interface
- **Persistence** of language selection in localStorage
- **Complete coverage** of translation for all UI elements

To add a new language:
1. Create a new JSON file in `/src/locales/`
2. Add the new language to the configuration in `/src/config/i18n.js`

### 🔄 State Management

Instead of using an external state management library, the application implements custom context providers for:

- **CartContext**: Cart state management with reducer pattern
- **I18nContext**: Internationalization with language switching
- **ToastContext**: Toast notifications for user feedback

### ⚡ Performance Optimizations

- **Debounced search** using RxJS to prevent excessive re-renders
- **Lazy loading** of product details
- **Memoization** of frequently rendered components
- **Client-side cache** to reduce API calls

## 🔌 API Integration

The application integrates with the following endpoints:

- `GET /api/product` - Retrieves the list of all products
- `GET /api/product/:id` - Retrieves detailed information of a specific product
- `POST /api/cart` - Adds a product to the shopping cart


## 🔮 Future Development Areas

This project is in continuous evolution. Various areas for future improvements have been identified and will be addressed in upcoming iterations:

### Performance Optimization
Improvements in the overall application performance will be implemented, including lazy loading for components and images, optimization of bundle sizes through code splitting, and refinement of the cache system for more granular data management.

### Responsive Design Improvements
Although the application is currently adaptable to different devices, work will be done to perfect the experience on intermediate resolutions and smaller screens, with special attention to the product details page and option selectors.

### User Experience
Skeleton loading states will be incorporated to improve performance perception, more intuitive navigation through enhanced breadcrumbs, and pagination or infinite scroll systems to handle large data sets.

### Testing and Quality
Unit test coverage will be expanded and integration tests will be implemented to ensure code robustness in more complex scenarios. This will include specific tests for cart components and the search system.

### Accessibility
Accessibility aspects will be improved by incorporating appropriate ARIA attributes, optimizing keyboard navigation, and enhancing color contrast according to WCAG standards.

These improvements represent a commitment to product quality and the intention to develop an application that not only meets the technical requirements but also offers an exceptional experience to the end user.