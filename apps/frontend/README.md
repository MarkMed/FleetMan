# FleetMan Frontend

Modern React application built with TypeScript and following MVVM architecture patterns.

## 🏗️ Architecture

### MVVM Structure
- **Models**: Domain entities and type definitions
- **Views**: React components and screens
- **ViewModels**: Custom hooks and state management
- **Services**: API communication and business logic

### Technology Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Hook Form + Zod** for forms and validation
- **Radix UI + shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React i18next** for internationalization

## 📁 Folder Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── ui/         # Base UI components (buttons, inputs, etc.)
│   ├── forms/      # Form-specific components
│   └── layout/     # Layout components (header, sidebar, etc.)
├── config/         # Application configuration
├── constants/      # Application constants and enums
├── helpers/        # Helper functions (deprecated, use utils)
├── hooks/          # Custom React hooks (ViewModels)
├── i18n/           # Internationalization setup and translations
│   └── locales/    # Translation files
├── models/         # TypeScript interfaces and types
├── navigation/     # Routing configuration
├── screens/        # Page-level components (Views)
│   ├── auth/       # Authentication screens
│   ├── machines/   # Machine management screens
│   ├── maintenance/# Maintenance screens
│   ├── quickcheck/ # Quick check screens
│   └── notifications/ # Notifications screens
├── services/       # API services and external integrations
│   └── api/        # API client and service layers
├── store/          # State management (Zustand stores)
│   └── slices/     # Individual store slices
├── theme/          # Theme configuration and styles
├── useCases/       # Business logic and use cases
├── utils/          # Utility functions
├── validators/     # Validation schemas (Zod) (deprecated, use models from ./packages/models)
└── viewModels/     # Complex view models and hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 🎨 Design System

### Theme
- Uses CSS custom properties for theming
- Supports light/dark mode
- System preference detection
- Tailwind CSS for utility classes

### Components
- Based on Radix UI primitives
- Styled with shadcn/ui patterns
- Fully accessible (WCAG 2.1)
- TypeScript first

### Colors
- Primary: Blue (fleet management theme)
- Status colors for machine states
- Semantic colors for alerts and notifications

## 🌐 Internationalization

- Spanish (es) - Default
- English (en) - Secondary
- Browser language detection
- Persistent language selection

### Adding Translations
1. Add keys to `src/i18n/locales/es.json` and `en.json`
2. Use the `useTranslation` hook in components
3. Follow the nested structure for organization

## 📱 Progressive Web App (PWA)

- Service worker for offline support
- App manifest for installation
- Icon generation and optimization
- Background sync capabilities

## 🔒 Authentication

- JWT-based authentication
- Refresh token rotation
- Role-based access control
- Secure token storage

## 📊 State Management

### Client State (Zustand)
- UI state (theme, sidebar, etc.)
- Authentication state
- Form state
- Lightweight and performant

### Server State (TanStack Query)
- API data caching
- Background refetching
- Optimistic updates
- Error handling

## 🧪 Testing Strategy

- Unit tests with Jest + React Testing Library
- Component testing
- Hook testing
- API service testing
- E2E testing with Playwright (planned)

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Path mapping for imports
- Interface over type aliases

### React
- Functional components only
- Custom hooks for logic
- Props interface definitions
- Default props handling

### Styling
- Tailwind CSS classes
- CSS custom properties for themes
- BEM methodology for complex components
- Mobile-first responsive design

## 🔧 Development Tools

### VSCode Setup
- Recommended extensions included
- Debugger configuration
- Workspace settings
- Code snippets

### Path Mapping
```typescript
// Use these imports
import { Button } from '@components/ui/Button';
import { useAuth } from '@hooks';
import { API_ENDPOINTS } from '@constants';
import type { User } from '@models';
```

## 🚀 Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. PWA manifest generation
5. Service worker compilation

### Environment Variables
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_FEATURE_*` - Feature flags

## 📈 Performance

### Optimization Strategies
- Code splitting by routes
- Lazy loading of components
- Image optimization
- Bundle size monitoring
- Tree shaking

### Monitoring
- Core Web Vitals tracking
- Error boundary implementation
- Performance metrics collection
- User experience monitoring

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Add translations for new strings
4. Write tests for new features
5. Follow the commit convention
6. Update documentation as needed

## 📚 Architecture Decisions

### Why MVVM?
- Clear separation of concerns
- Testable business logic
- Reusable view models
- Better code organization

### Why Zustand over Redux?
- Smaller bundle size
- Less boilerplate
- TypeScript friendly
- Simple API

### Why TanStack Query?
- Excellent caching strategy
- Background refetching
- Optimistic updates
- Error handling

### Why shadcn/ui?
- Copy-paste components
- Full customization control
- TypeScript support
- Accessibility built-in

## 🔮 Future Enhancements

- Offline-first architecture
- Real-time notifications
- Advanced PWA features
- Micro-frontend architecture
- Advanced analytics integration