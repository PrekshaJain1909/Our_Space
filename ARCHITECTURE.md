# Our_Space Architecture

This document provides an overview of the architecture for the Our_Space application, describing the main components, technologies, and how they interact.

## Overview

Our_Space is a full-stack web application designed for couples to track, share, and celebrate their journey together. It consists of a React frontend and a Node.js/Express backend, with MongoDB as the database.

## High-Level Structure

```
Ourspace/
  client/      # Frontend React app
  server/      # Backend Node.js/Express API
```

---

## Frontend (client/)
- **Framework:** React (with Vite for fast development)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **API Communication:** Axios
- **Features:**
  - Authentication
  - Analytics (relationship, alcohol, cigarette)
  - Mood Tracking
  - Love Notes
  - Memory Box
  - Bucket List
  - Healing Zone
  - Timeline
  - Responsive UI
- **Structure:**
  - `src/components/` – Reusable UI and feature components
  - `src/features/` – Feature-specific logic and pages
  - `src/context/` – Context providers for global state
  - `src/api/` – API clients for backend communication
  - `src/assets/` – Icons, images, styles
  - `src/layouts/` – Layout components
  - `src/routes/` – Route definitions
  - `src/utils/` – Utility functions

---

## Backend (server/)
- **Framework:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JWT-based
- **Features:**
  - RESTful API endpoints for all features
  - User and couple management
  - Data analytics endpoints
  - Resource and memory management
- **Structure:**
  - `models/` – Mongoose models for data entities
  - `routes/` – Express route handlers
  - `middleware/` – Authentication and other middleware
  - `utils/` – Utility functions
  - `data/` – Seed data or static files

---

## Data Flow
1. **Frontend** sends requests to the **backend API** using Axios.
2. **Backend** processes requests, interacts with **MongoDB**, and returns responses.
3. **Frontend** updates UI and state based on API responses.

---

## Key Technologies
- **React**: UI library for building interactive interfaces
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Node.js/Express**: Backend server and API
- **MongoDB**: NoSQL database
- **Axios**: HTTP client for API requests
- **JWT**: Authentication tokens

---

## Extensibility & Contributing
- Modular feature structure for easy addition of new features
- Clear separation of concerns between frontend and backend
- New developers can start by exploring the `client/features/` and `server/routes/` folders

---

## Diagram

```
[ React Frontend ] <----Axios----> [ Express Backend ] <----Mongoose----> [ MongoDB ]
```

---

## Notes
- Environment variables are managed via `.env` files (see README for setup)
- All API endpoints are documented in the backend code
- Frontend uses Context API for global state (auth, UI, couple data)

---

For more details, see the README and explore the codebase.
