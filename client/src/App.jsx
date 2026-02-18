import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";
import DashboardPage from "./features/dashboard/pages/DashboardPage.jsx";
import CoupleProfilePage from "./features/coupleProfile/pages/CoupleProfilePage.jsx";
import LoveNotesPage from "./features/loveNotes/pages/LoveNotesPage.jsx";
import HealingZonePage from "./features/healingZone/pages/HealingZonePage.jsx";
import AnalyticsPage from "./features/analytics/pages/AnalyticsPage.jsx";
import PlaytimePage from "./features/playtime/pages/PlaytimePage.jsx";
import BucketPage from "./features/bucket/pages/BucketPage.jsx";
import TimelinePage from "./features/timeline/pages/TimelinePage.jsx";
import MemoryBoxPage from "./features/memoryBox/pages/MemoryBoxPage.jsx";
import MoodPage from "./features/mood/pages/MoodPage.jsx";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage.jsx";
import InvitePage from "./features/invite/pages/InvitePage.jsx";
import { AuthProvider } from "./features/context/AuthContext";

<AuthProvider>
  <App />
</AuthProvider>



// Simple fallback page
function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-slate-300">Page not found</p>
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-medium text-white hover:bg-pink-600 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}



export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        {/* Auth routes only at /login and /register, with minimal layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main app routes: always show MainLayout, never redirect to login */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/couple" element={<CoupleProfilePage />} />
          <Route path="/love-notes" element={<LoveNotesPage />} />
          <Route path="/healing-zone" element={<HealingZonePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
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