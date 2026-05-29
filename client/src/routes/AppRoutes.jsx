import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
const BucketDetailPage = React.lazy(() => import('../features/bucket/pages/BucketDetailPage.jsx'));

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
import MonthlyDataPage from "../features/monthlyData/pages/MonthlyDataPage.jsx";
import PlaytimePage from "../features/playtime/pages/PlaytimePage.jsx";
import BucketPage from "../features/bucket/pages/BucketPage.jsx";
import TimelinePage from "../features/timeline/pages/TimelinePage.jsx";
import MemoryBoxPage from "../features/memoryBox/pages/MemoryBoxPage.jsx";
import MoodPage from "../features/mood/pages/MoodPage.jsx";


// Loading screen
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-primary text-primary">
    <div className="card animate-pulse text-secondary">
      Loading your love world...
    </div>
  </div>
);

// 404 Page
const NotFoundPage = () => (
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

// Protect routes that need login



const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If token exists but we haven't loaded user yet, show loading
  if (isAuthenticated && !user) {
    return <LoadingScreen />;
  }

  // If user is authenticated but not verified, redirect to OTP verification
  if (user && user.isVerified === false) {
    return <Navigate to="/verify-otp" replace />;
  }

  return children;
};

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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/couple"
          element={
            <ProtectedRoute>
              <CoupleProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/love-notes"
          element={
            <ProtectedRoute>
              <LoveNotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/healing-zone"
          element={
            <ProtectedRoute>
              <HealingZonePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monthly-data"
          element={
            <ProtectedRoute>
              <MonthlyDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playtime"
          element={
            <ProtectedRoute>
              <PlaytimePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bucket"
          element={
            <ProtectedRoute>
              <BucketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bucket/:taskId"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<div>Loading...</div>}>
                <BucketDetailPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute>
              <TimelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory-box"
          element={
            <ProtectedRoute>
              <MemoryBoxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <MoodPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
