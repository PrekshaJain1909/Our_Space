import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layouts
import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

// Auth pages
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage.jsx";
import JoinPage from "../features/auth/pages/JoinPage.jsx";

// Main feature pages
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import CoupleProfilePage from "../features/coupleProfile/pages/CoupleProfilePage.jsx";
import LoveNotesPage from "../features/loveNotes/pages/LoveNotesPage.jsx";
import HealingZonePage from "../features/healingZone/pages/HealingZonePage.jsx";
import AnalyticsPage from "../features/analytics/pages/AnalyticsPage.jsx";
import PlaytimePage from "../features/playtime/pages/PlaytimePage.jsx";
import BucketPage from "../features/bucket/pages/BucketPage.jsx";
import TimelinePage from "../features/timeline/pages/TimelinePage.jsx";
import MemoryBoxPage from "../features/memoryBox/pages/MemoryBoxPage.jsx";
import MoodPage from "../features/mood/pages/MoodPage.jsx";


// Loading screen
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
    <div className="animate-pulse rounded-xl bg-slate-800 px-6 py-4 text-sm">
      Loading your love world...
    </div>
  </div>
);

// 404 Page
const NotFoundPage = () => (
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

// Protect routes that need login



export default function AppRoutes() {
  return (
    <Routes>
      {/* Use MainLayout for the app shell so topbar + sidebar are always present.
          Public auth routes remain accessible at /login and /register. */}
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/:inviteCode" element={<JoinPage />} />
        <Route path="/invite/:inviteCode" element={<JoinPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/couple" element={<CoupleProfilePage />} />
        <Route path="/love-notes" element={<LoveNotesPage />} />
        <Route path="/healing-zone" element={<HealingZonePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/playtime" element={<PlaytimePage />} />
        <Route path="/bucket" element={<BucketPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/memory-box" element={<MemoryBoxPage />} />
        <Route path="/mood" element={<MoodPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
