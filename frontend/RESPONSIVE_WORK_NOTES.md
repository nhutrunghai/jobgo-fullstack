# Responsive Work Notes

## Goal

Continue making the frontend mobile responsive section by section.

Primary constraint from the user:

- Do not change the current desktop/web UI.
- Responsive changes must be scoped to mobile/tablet breakpoints.
- Prefer `sm:`, `md:`, `lg:`, `xl:` Tailwind classes so desktop remains visually unchanged.
- When mobile has too many controls, hide secondary UI behind an icon/menu/drawer instead of showing long horizontal lists.

## Working Style

- Read the target component first before editing.
- Keep changes narrowly scoped to the requested page/section.
- After edits, run:

```bash
npm run build
```

- The project is not necessarily a git repo in this workspace, so do not rely on `git diff`.
- Avoid broad visual redesigns. Fix layout, wrapping, overflow, ordering, and mobile usability only.

## Patterns To Use

### Desktop preservation

Use mobile-first classes and restore desktop using breakpoints:

```jsx
className="p-4 lg:p-5"
className="grid grid-cols-1 lg:grid-cols-12"
className="min-h-screen lg:ml-64"
```

### Dashboard navigation

Desktop:

- Fixed sidebar remains visible from `lg` upward.

Mobile:

- Use top bar with a `menu` icon.
- Open a slide-out drawer from the left.
- Put dashboard navigation items inside the drawer.
- Do not use long horizontal nav chips for dashboard sections.

Implemented in:

- `src/components/DashboardSidebar.jsx`

### AI Agent mobile

Mobile should behave like a chat app:

- Chat message area scrolls independently.
- Input/footer stays fixed at the bottom of the chat panel.
- Chat history, CV selection, and settings are hidden behind a menu icon/drawer.
- Do not show conversation history as horizontal chips inside the chat screen.

Implemented in:

- `src/pages/AIAgent.jsx`

### Public nav mobile

For normal public pages (`home`, `search`, `job detail`, `discussions`, `AI Agent`):

- Desktop nav links can remain inline from `lg`.
- On mobile, show compact nav links/buttons for:
  - `Việc làm IT`
  - `Bài viết`
  - `AI Agent`

## Completed So Far

### Auth/Login

File:

- `src/pages/AuthPortal.jsx`

Changes:

- Mobile order is `MYCODER` title, page title, then form.
- Nonessential intro/stats/contact content hidden on mobile.
- Form pulled upward on mobile.
- Desktop layout preserved.

### Home

File:

- `src/App.jsx`

Changes:

- Header/mobile buttons co-fit.
- Mobile public nav added.
- Hero no longer overflows mobile.
- Search input/button stacks on mobile.
- Main content comes before sidebars on mobile.
- Job cards stack actions on mobile.

### Search Jobs

File:

- `src/pages/SearchJobs.jsx`

Changes:

- Search/filter bar stacks on mobile.
- Lower API filter sidebar hidden on mobile to avoid duplicate filters.
- Top search bar includes all filters: job type, keyword, location, level.
- Results appear before desktop sidebar on mobile.

### Job Detail

File:

- `src/pages/JobDetail.jsx`

Changes:

- Header/search bar stacks on mobile.
- Breadcrumb and job title wrap safely.
- Job summary/stat cards fit mobile.
- Apply modal spacing/buttons improved.

### Dashboard User And Dashboard Navigation

Files:

- `src/components/DashboardSidebar.jsx`
- `src/pages/Dashboard.jsx`
- all dashboard pages with `ml-64` changed to `lg:ml-64`

Changes:

- Mobile top bar with menu icon opens drawer.
- Desktop fixed sidebar preserved.
- Main content no longer shifts right on mobile.
- Dashboard overview cards/actions/activity adjusted for mobile.

### Applied Jobs

File:

- `src/pages/JobList.jsx`

Changes:

- Header title/subtitle no longer breaks on mobile.
- Action buttons stack into two columns on mobile.

### Messages

Files:

- `src/pages/MessagesCenter.jsx`
- `src/pages/tuyen-dung/EmployerMessages.jsx`

Changes:

- Candidate messages layout stacks on mobile.
- Conversation list has limited height and scroll.
- Chat panel has usable mobile height.
- Employer messages input stacks on mobile.

### Discussions / Blog

File:

- `src/pages/Discussions.jsx`

Changes:

- Header mobile nav added.
- Header and count badge fit mobile.
- Post cards avoid overflow.

### AI Agent

File:

- `src/pages/AIAgent.jsx`

Changes:

- Public nav mobile added.
- Mobile chat uses menu drawer for history/settings/CV selection.
- Chat input is in sticky/fixed footer area of chat panel.
- Chat content scrolls independently.
- Desktop chat sidebar preserved.

## Next Work

Continue responsive work one section at a time as requested by the user.

Likely remaining pages:

- Notifications
- Uploaded CVs
- Job progress
- Contracts
- Milestones
- Employer dashboard pages
- User profile/settings pages

