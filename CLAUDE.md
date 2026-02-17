# ExploraVist Admin Portal

Internal admin portal for ExploraVist with work management and DevOps dashboard.

## Tech Stack
- Vite + React (JavaScript, no TypeScript)
- Firebase Auth (email/password) + Firestore (real-time listeners)
- react-router-dom v6
- lucide-react for icons
- Plain CSS with CSS variables (dark theme)
- React Context + hooks only (no state management library)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Project Structure
- `src/firebase.js` — Firebase init
- `src/contexts/AuthContext.jsx` — Auth state, role, team, login/logout
- `src/hooks/useFirestoreQuery.js` — Core Firestore subscription with global query cache and re-render minimization
- `src/hooks/useTasks.js` — Task CRUD + real-time subscriptions (per-team scoping)
- `src/hooks/useComments.js` — Comment CRUD for tasks
- `src/hooks/useDevices.js` — Device read + mint
- `src/components/` — Shared components (ProtectedRoute, Sidebar, TopBar, Modal, badges)
- `src/pages/` — Route pages
- `src/utils/constants.js` — Teams, statuses, priorities, admin emails

## Firestore Collections
- `adminUsers/{uid}` — Admin portal users (separate from app `users`)
- `tasks/{taskId}` — Work management tasks
- `tasks/{taskId}/comments/{commentId}` — Task comments
- `devices/{deviceId}` — IoT devices (shared with Cloud-Development)

## Permissions Model
- Admins (defined in constants.js) see all teams and can manage permissions
- Members see only teams they're assigned to via the Permissions page
- All authenticated users can view devices; only admins can mint

## Firestore Cost Optimization
- `useFirestoreQuery` uses a global listener cache keyed by serialized query
- Multiple components sharing the same query share a single `onSnapshot` listener
- Re-renders only occur when document data actually changes (fingerprint comparison)
- Queries are scoped per-team to avoid reading unnecessary documents

## Environment Variables
Copy `.env.example` to `.env` and fill in Firebase config values.
