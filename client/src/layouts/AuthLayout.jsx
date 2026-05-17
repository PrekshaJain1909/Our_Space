import React from "react";
import { Outlet } from "react-router-dom";
import AuthNavbar from "../features/auth/components/AuthNavbar";
import "../features/auth/styles/AuthNavbar.css";

/**
 * Wraps login, register, and join routes with a fixed top navbar.
 */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <AuthNavbar />
      <main className="auth-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
