# Local Development: Running Frontend & Backend

## 1. Start the Backend (API Server)

Open a terminal and run:

```
cd server
npm install
npm start
```

- The backend will run on http://localhost:5000
- Make sure your .env file in server/ is configured (see server/.env.example if available)

## 2. Start the Frontend (React App)

Open a new terminal and run:

```
cd client
npm install
npm run dev
```

- The frontend will run on http://localhost:5173 (or 5174)
- The frontend is configured to use the backend API at http://localhost:5000/api via the .env file

## 3. API Requests

- All API requests from the frontend are proxied to the backend using the base URL in client/.env (`VITE_API_BASE_URL`)
- CORS is enabled on the backend for local frontend URLs

## 4. Troubleshooting

- If you get CORS errors, check that CLIENT_ORIGIN in server/.env matches your frontend URL
- If API requests fail, ensure both servers are running and accessible

---

**You are now set up for full-stack local development!**
