# School Dashboard

A React + Node.js school dashboard prototype with separate frontend components and a backend API.

## Architecture

- `src/` — React application and UI components
- `src/components/` — feature components for attendance, notifications, homework, exams, fees, communication, and performance
- `src/services/api.js` — frontend API helper to fetch backend data
- `server/` — Express API server
- `server/routes/` — route definitions
- `server/data/` — sample dashboard data source

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start frontend + backend together:
   ```bash
   npm run dev
   ```
3. Open the Vite app at:
   `http://localhost:5173`

## Login troubleshooting

The login page requires both the frontend and API server. Start them together with:

```bash
npm run dev
```

If the school list reports that the server is offline, confirm the API is available at
`http://localhost:4000/api/auth/schools`, then refresh the login page.

## Good architecture suggestions

- Keep UI state in React and fetch data from the server via REST or GraphQL.
- Use feature-based folders for React components.
- Keep server routes small and decoupled by resource.
- Add a real database later (PostgreSQL, MongoDB, or Firebase) and move sample data out of memory.
- Use environment variables for configuration and separate dev/prod behavior.
