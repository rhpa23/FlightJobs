# FlightJobs Modernization - Frontend UI Completion Plan

## Overview

This document outlines the plan for completing the React frontend UI, including component architecture, page implementations, and styling guidelines.

---

## 1. Current State

### 1.1 Implemented Components
| Component | Status | Notes |
|-----------|--------|-------|
| App.tsx | ⚠️ Placeholder | Basic status display only |
| Login.tsx | ✅ Complete | Form with validation |
| Dashboard.tsx | ✅ Complete | Statistics display |
| ProtectedRoute.tsx | ❌ Missing | Route guard not implemented |
| API Service | ✅ Complete | Axios with interceptors |
| Redux Slices | ✅ Complete | All 4 slices defined |

### 1.2 Missing Components
| Component | Priority | Description |
|-----------|----------|-------------|
| Header | High | Top navigation bar |
| Sidebar | High | Side navigation menu |
| Layout | High | Main layout wrapper |
| Register Page | High | User registration |
| Search Jobs Page | High | Job search interface |
| Airlines Page | Medium | Airline management |
| Profile Page | Medium | Pilot profile |
| Challenges Page | Medium | Challenge system |
| Leaderboards Page | Low | Statistics display |
| Settings Page | Low | User preferences |

---

## 2. Component Architecture

### 2.1 Layout Components

#### Header Component
```tsx
// src/components/layout/Header.tsx
interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

// Features:
// - Logo and brand name
// - User avatar and dropdown menu
// - Quick stats display (bank balance, pilot score)
// - Notification bell
// - Mobile menu toggle
```

#### Sidebar Component
```tsx
// src/components/layout/Sidebar.tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

// Navigation items:
// - Dashboard
// - Search Jobs
// - My Jobs
// - Airlines
// - Challenges
// - Profile
// - Leaderboards
// - Settings
```

#### Layout Component
```tsx
// src/components/layout/Layout.tsx
interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

// Features:
// - Header and Sidebar wrapper
// - Main content area
// - Footer
// - Loading overlay
// - Toast notifications container
```

### 2.2 UI Components

#### Card Component
```tsx
// src/components/ui/Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}
```

#### StatCard Component
```tsx
// src/components/ui/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

#### DataTable Component
```tsx
// src/components/ui/DataTable.tsx
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
```

#### Modal Component
```tsx
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Toast Component
```tsx
// src/components/ui/Toast.tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}
```

---

## 3. Page Implementations

### 3.1 Register Page

```tsx
// src/pages/Register.tsx
// Features:
// - Registration form with validation
// - Email, password, first name, last name
// - Password confirmation
// - Terms acceptance
// - Link to login page
// - Error handling
// - Success redirect to dashboard
```

### 3.2 Search Jobs Page

```tsx
// src/pages/SearchJobs.tsx
// Features:
// - Search form:
//   - Origin airport (autocomplete)
//   - Destination airport (autocomplete)
//   - Alternative airport (optional)
//   - Range slider (10-450 NM)
//   - Aviation type filter
//   - Custom plane capacity selector
// - Search results table:
//   - Selectable rows
//   - Distance, pax, cargo, pay columns
//   - Total summary
// - Airport tips:
//   - Alternative suggestions
//   - Arrival suggestions
// - Confirm button
// - SimBrief integration
```

### 3.3 Airlines Page

```tsx
// src/pages/Airlines.tsx
// Features:
// - Airlines list with cards
// - Create airline modal
// - Edit airline modal
// - Airline details view
// - Certificate management
// - Pilot list
// - Join/leave airline
// - Airline ledger
// - FBO management
```

### 3.4 Profile Page

```tsx
// src/pages/Profile.tsx
// Features:
// - Pilot info display
// - Avatar upload
// - Flight logbook table:
//   - Sortable columns
//   - Filtering
//   - Pagination
// - License management:
//   - License items
//   - Purchase buttons
//   - Expiration dates
// - Custom plane capacity:
//   - Create/edit/delete
//   - Image upload
// - Fund transfer
// - Email preferences
```

### 3.5 Challenges Page

```tsx
// src/pages/Challenges.tsx
// Features:
// - Available challenges list
// - Create challenge form:
//   - Pax, cargo, pax weight
//   - Origin, destination
//   - Challenge type (Civilian/Military/Rescue)
// - Challenge briefing display
// - Challenge assignment
// - My challenges section
// - Challenge expiration countdown
```

### 3.6 Leaderboards Page

```tsx
// src/pages/Leaderboards.tsx
// Features:
// - Tab navigation:
//   - Score leaderboard
//   - Flights leaderboard
//   - Earnings leaderboard
//   - Airline rankings
// - User ranking highlight
// - Pagination
```

### 3.7 Settings Page

```tsx
// src/pages/Settings.tsx
// Features:
// - Account settings
// - Email notification preferences
// - Weight unit preference (kg/lbs)
// - Password change
// - Danger zone (delete account)
```

---

## 4. Styling Guidelines

### 4.1 Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Add custom colors for aviation theme
        sky: {
          50: '#f0f9ff',
          // ... sky color palette
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 4.2 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#3b82f6` | Primary actions, links |
| `--color-success` | `#10b981` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-danger` | `#ef4444` | Error states |
| `--color-bg-dark` | `#1f2937` | Dark background |
| `--color-bg-card` | `#374151` | Card background |
| `--color-text-primary` | `#f9fafb` | Primary text |
| `--color-text-secondary` | `#9ca3af` | Secondary text |

### 4.3 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 5. State Management

### 5.1 Redux Store Structure

```
store/
├── authSlice.ts       # Authentication state
├── jobsSlice.ts       # Jobs state
├── airlinesSlice.ts   # Airlines state
├── statisticsSlice.ts # Statistics state
└── uiSlice.ts         # UI state (new)
```

### 5.2 UI Slice (New)

```typescript
// src/store/slices/uiSlice.ts
interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  toasts: Toast[];
  modals: Record<string, boolean>;
}

// Actions:
// - toggleSidebar
// - setLoading
// - addToast
// - removeToast
// - openModal
// - closeModal
```

### 5.3 Local State Guidelines

- Use `useState` for component-specific state
- Use `useReducer` for complex component state
- Use Redux for shared/global state
- Use React Query for server state (optional)

---

## 6. Routing Structure

```tsx
// src/App.tsx
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="search" element={<SearchJobs />} />
              <Route path="jobs">
                <Route index element={<MyJobs />} />
                <Route path=":id" element={<JobDetails />} />
              </Route>
              <Route path="airlines">
                <Route index element={<Airlines />} />
                <Route path=":id" element={<AirlineDetails />} />
                <Route path=":id/ledger" element={<AirlineLedger />} />
              </Route>
              <Route path="challenges" element={<Challenges />} />
              <Route path="profile">
                <Route index element={<Profile />} />
                <Route path="logbook" element={<Logbook />} />
                <Route path="licenses" element={<Licenses />} />
              </Route>
              <Route path="leaderboards" element={<Leaderboards />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};
```

---

## 7. Implementation Order

### Phase 1: Foundation (Week 1-2)
1. Configure Tailwind CSS
2. Create layout components (Header, Sidebar, Layout)
3. Implement ProtectedRoute
4. Create Register page
5. Create UI component library

### Phase 2: Core Pages (Week 3-4)
1. Complete Dashboard integration
2. Implement Search Jobs page
3. Implement My Jobs page
4. Implement Job Details page

### Phase 3: Advanced Pages (Week 5-6)
1. Implement Airlines page
2. Implement Airline Details page
3. Implement Airline Ledger page
4. Implement Profile page

### Phase 4: Remaining Features (Week 7-8)
1. Implement Challenges page
2. Implement Leaderboards page
3. Implement Settings page
4. Add loading states and error boundaries
5. Responsive design testing

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Test all UI components
- Test Redux slices
- Test utility functions
- Test form validation

### 8.2 Integration Tests
- Test page components with Redux
- Test API service integration
- Test routing

### 8.3 E2E Tests
- Test authentication flow
- Test job search flow
- Test airline creation flow
- Test profile management

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05*
