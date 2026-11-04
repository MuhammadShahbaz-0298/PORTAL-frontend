# School Portal: Frontend

Mobile-first web app for a school portal: assignments, ZIP submissions, grading,
attendance, batches, users and roles. It talks to the `PORTAL-backend` REST API.

## Tech stack

React 18, Vite, Tailwind CSS v4, Rematch (a small layer on Redux), TanStack
Router, Axios, SweetAlert2 (confirm dialogs only) and Lucide icons.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer), as required by Vite
- The backend running locally (see the backend README)

## Quick start

```bash
npm install
copy env.local.template .env.local      # Windows
# cp env.local.template .env.local      # macOS / Linux
npm run dev
```

Open `http://localhost:5173`. The backend only allows the address set in its
`FRONTEND_URL`, so keep the dev server on port 5173 (or change `FRONTEND_URL`).
Sign in with the admin account created by the backend's `npm run seed:admin`.

## Environment variables

Set these in `.env.local`. Everything starting with `VITE_` is public in the
browser, so never put a secret here.

| Name             | Required | Example                     | Notes                                                    |
| ---------------- | -------- | --------------------------- | -------------------------------------------------------- |
| `VITE_API_URL`   | yes      | `http://localhost:5000/api` | Backend address. `/api` is added if it is missing.       |
| `VITE_APP_TITLE` | no       | `School Portal`             | Name shown in the sidebar and top bar.                   |
| `VITE_APP_LOGO`  | no       | `/logo.svg`                 | Read by `src/config/env.js` but not used by the UI yet.  |

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server.                     |
| `npm run build`   | Build for production into `dist/`.        |
| `npm run preview` | Serve the production build locally.       |
| `npm run check`   | Same as build. Catches broken imports.    |
| `npm run lint`    | Check code with ESLint.                   |
| `npm run format`  | Format `src/` with Prettier.              |

There are no automated frontend tests yet. After a change, run
`npm run build`, then click through the pages in the browser, including at
phone width (375px).

## Pages

The navigation is built from `src/routes-config.js`. A page only shows for users
who have its permission.

| Page                  | Route                    | Permission          | Who normally uses it  |
| --------------------- | ------------------------ | ------------------- | --------------------- |
| Dashboard             | `/dashboard`             | `dashboard.view`    | Everyone              |
| Assignments           | `/assignments`           | `assignments.view`  | Everyone              |
| Assignment detail     | `/assignments/:id`       | `assignments.view`  | Everyone              |
| Submissions           | `/submissions`           | `submissions.view`  | Students, teachers    |
| Grading               | `/grading`               | `submissions.grade` | Teachers, admins      |
| Batches               | `/batches`               | `batches.view`      | Teachers, admins      |
| Attendance            | `/attendance`            | `attendance.view`   | Everyone              |
| Users                 | `/users`                 | `users.manage`      | Admins                |
| Roles and permissions | `/roles-permissions`     | `roles.manage`      | Admins                |
| Profile               | `/profile`               | `profile.view`      | Everyone              |
| Sign in               | `/login`                 | public              | Everyone              |
| Change password       | `/force-change-password` | signed in           | After an admin reset  |

On phones the main pages sit in a bottom bar and the rest are under "More". On
larger screens there is a left sidebar. Hiding a page is only a convenience. The
backend decides what each person can really do.

## How the code is organised

```
src/
  api/              One file per backend area. The only place that calls the API.
  components/
    layout/         AppLayout, Sidebar, BottomNav, MoreSheet, Topbar, Brand
    ui/             Shared pieces: Button, Modal, Table, DataList, Toast, ...
  config/env.js     Reads the VITE_ variables.
  constants/        Shared sizes and timings.
  features/<name>/  One folder per page: Page, Card, form Modal, small helpers.
  lib/              Small helpers: permissions, session timer, class names.
  routes/           The route tree.
  routes-config.js  Menu items, icons and the permission each page needs.
  store/
    index.js        Registers every model.
    models/         One Rematch model per feature.
  styles/index.css  Tailwind import and every colour, radius and shadow token.
```

Data flows in one direction:

```
Page (connect) -> model effect -> src/api/<feature>.js -> backend
      ^                |
      +---- state -----+
```

- Pages read state with `connect` and call model effects. They never call
  `src/api` directly.
- A model holds the list, loading and error state for one feature, and its
  effects do the API work.
- Form errors show inside the modal. The Toast is for page-level messages.

## Add a new feature

Copy the Users feature, the closest complete example, and rename it.

1. `src/api/<feature>.js`: copy `src/api/users.js` and change the paths.
2. `src/store/models/<feature>.js`: copy `users.js` and rename the state, reducers
   and effects.
3. Register the model in `src/store/index.js`.
4. `src/features/<feature>/`: copy `UsersPage.jsx`, `UserCard.jsx` and
   `UserFormModal.jsx` and rename them.
5. Add the route in `src/routes/index.jsx`.
6. Add the menu entry in `src/routes-config.js`: path, label, icon name and
   permission.
7. Add the icon name to `NAV_ICONS` in `src/components/layout/navConfig.js`.
8. Add the permission to the backend (`config/permissions.js`) and give it to
   the roles that need it.
9. Run `npm run build` and test the page at phone width.

## Design system

Colours, radii and shadows are tokens in `src/styles/index.css`. Use token names
such as `bg-surface`, `text-ink`, `border-line` and `bg-brand` instead of fixed
colours, so a future theme change (for example dark mode) stays a small job.

- Light theme, one blue accent, Inter font.
- Lists are cards on phones and a table from tablet width up (`DataList`).
- Modals are bottom sheets on phones and centred dialogs on larger screens.
- Buttons and tap targets are at least 44px tall.
- Confirmations for archive and reset use `ConfirmDialog`.

## Security notes

- The sign-in cookies are `httpOnly`. The app never reads or stores tokens, and
  keeps only the last-activity time in `localStorage`.
- `src/api/client.js` sends cookies (`withCredentials`), adds the
  `x-csrf-protection: 1` header to every `POST`, `PUT`, `PATCH` and `DELETE`, and
  on a `401` refreshes the session once and retries.
- A person is signed out after 10 minutes without activity. The number is in
  `src/lib/session.js` and must match the backend `IDLE_TIMEOUT_MINUTES`.
- After an admin resets a password, the backend answers
  "You must change your password before continuing." and the app sends the
  person to `/force-change-password`.
- One-time passwords are shown once in a modal and cleared from memory when it
  closes.
- Upload checks (`.zip` type and size) happen in the browser for convenience.
  The backend checks everything again.
- Deleting in the interface means archiving. History is kept.

## Troubleshooting

| Problem                                   | Likely cause and fix                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Network or CORS error on sign-in          | Backend `FRONTEND_URL` does not exactly match the address in the browser. |
| Build fails with an import error          | A file was renamed or deleted. Run `npm run build` and read the path.     |
| Page missing from the menu                | The signed-in role lacks that page's permission.                          |
| Signed out after 10 minutes               | Intended. It is the idle timeout.                                         |
