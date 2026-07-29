import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import CoupleProfilePage from "./features/coupleProfile/pages/CoupleProfilePage.jsx";
import LoveNotesPage from "./features/loveNotes/pages/LoveNotesPage.jsx";
import HealingZonePage from "./features/healingZone/pages/HealingZonePage.jsx";
import AnalyticsPage from "./features/analytics/pages/AnalyticsPage.jsx";
import HabitDetailPage from "./features/analytics/pages/HabitDetailPage.jsx";
import PlaytimePage from "./features/playtime/pages/PlaytimePage.jsx";
import BucketPage from "./features/bucket/pages/BucketPage.jsx";
import TimelinePage from "./features/timeline/pages/TimelinePage.jsx";
import MemoryBoxPage from "./features/memoryBox/pages/MemoryBoxPage.jsx";
import MoodPage from "./features/mood/pages/MoodPage.jsx";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage.jsx";
import InvitePage from "./features/invite/pages/InvitePage.jsx";
import JoinPage from "./features/auth/pages/JoinPage.jsx";

// Simple fallback page
function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary text-primary">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-secondary">Page not found</p>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}



export default function App() {
  return (
    <div className="min-h-screen bg-primary text-primary">
      <Routes>
        {/* Auth routes only at /login and /register, with minimal layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/join/:inviteCode" element={<JoinPage />} />
          <Route path="/invite/:inviteCode" element={<JoinPage />} />
        </Route>

        {/* Main app routes: always show MainLayout, never redirect to login */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/couple" element={<CoupleProfilePage />} />
          <Route path="/love-notes" element={<LoveNotesPage />} />
          <Route path="/healing-zone" element={<HealingZonePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/monthly-data/:habitId" element={<HabitDetailPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/playtime" element={<PlaytimePage />} />
          <Route path="/bucket" element={<BucketPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/memory-box" element={<MemoryBoxPage />} />
          <Route path="/mood" element={<MoodPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}