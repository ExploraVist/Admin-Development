# ExploraVist Admin Portal

Internal admin portal for ExploraVist — work management across 7 teams and a DevOps dashboard for managing IoT devices.

**Production URL:** `dev.exploravist.net` (deployed via Netlify from `main`)

---

## Tech Stack

- **Vite + React** (JavaScript)
- **Firebase Auth** (email/password) + **Firestore** (real-time listeners)
- **react-router-dom v6** — client-side routing
- **lucide-react** — icons
- **Plain CSS** with CSS variables — dark theme matching the main ExploraVist site

---

## Branching & Deployment

> **Do NOT commit directly to `main` or `development`.**

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production | `dev.exploravist.net` (Netlify) |
| `development` | Integration/staging | — |
| `feature/*` | Feature branches | — |

### Workflow

1. Create a feature branch **off `development`**:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, commit, push:
   ```bash
   git push -u origin feature/your-feature-name
   ```
3. Open a **Pull Request** → `feature/your-feature-name` → `development`
4. Get it reviewed and merged into `development`
5. When `development` is stable, open a **Pull Request** → `development` → `main`
6. Merging to `main` triggers a production deploy to Netlify

---

## Local Setup

### Prerequisites
- Node.js 18+
- Firebase account with access to `exploravist-core` project

### Installation

```bash
git clone https://github.com/ExploraVist/Admin-Development.git
cd Admin-Development
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the Firebase config values:

```bash
cp .env.example .env
```

Get these values from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your Apps → Web App:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Run Locally

```bash
npm run dev
```

---

## Project Structure

```
src/
  main.jsx                    # Router setup, lazy-loaded routes
  index.css                   # CSS variables (dark theme)
  firebase.js                 # Firebase init (auth + Firestore)
  contexts/AuthContext.jsx     # Auth state, role, team, login/logout
  hooks/
    useAuth.js                # Shortcut to AuthContext
    useFirestoreQuery.js      # Core Firestore subscription with global query cache
    useTasks.js               # Task CRUD + real-time subscriptions
    useComments.js            # Task comments
    useDevices.js             # Device read + mint
  components/
    ProtectedRoute.jsx        # Auth guard + layout shell
    Sidebar.jsx               # Left nav (team-filtered for members)
    TopBar.jsx                # Page title + user dropdown
    Modal.jsx                 # Reusable modal
    StatusBadge.jsx           # Task status pill
    PriorityBadge.jsx         # Priority indicator
    LoadingSpinner.jsx        # Spinner
  pages/
    Login.jsx                 # Email/password sign-in
    Dashboard.jsx             # My tasks, stats, upcoming due dates
    Permissions.jsx           # Admin: assign teams + roles to users
    tasks/
      TaskBoard.jsx           # Team task list with status filters
      TaskDetail.jsx          # Single task: subtasks, comments, status, claim
      TaskForm.jsx            # Create/edit task modal
    devops/
      DeviceList.jsx          # Device table with active/inactive status
      DeviceDetail.jsx        # Single device info
      MintDevice.jsx          # Generate deviceId + secret
  styles/                     # Per-page CSS files
  utils/constants.js          # Teams, statuses, priorities, admin emails
```

---

## Permissions Model

- **Admins** (defined in `constants.js`) — see all teams, can edit/delete any task, mint devices, manage permissions
- **Members** — see only teams assigned to them via the Permissions page, can create tasks, edit/claim tasks assigned to them
- Role is auto-determined on first login by email, then manageable by admins at `/admin/permissions`

---

## Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `adminUsers/{uid}` | Portal users (separate from app `users`) — stores role, team assignments |
| `tasks/{taskId}` | Work management tasks with status, priority, assignee |
| `tasks/{taskId}/comments/{commentId}` | Task comments |
| `devices/{deviceId}` | IoT devices (shared with Cloud-Development) |

---

## Firestore Cost Optimization

The `useFirestoreQuery` hook implements a global listener cache:
- Multiple components using the same query share **one** `onSnapshot` listener
- Re-renders only occur when document data actually changes (fingerprint comparison)
- Queries are scoped per-team to avoid reading unnecessary documents
- Listeners auto-unsubscribe when the last consumer unmounts

---

## Firebase CLI

Deploy Firestore security rules and indexes:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `firebase deploy --only firestore:rules,firestore:indexes` | Deploy Firestore config |
