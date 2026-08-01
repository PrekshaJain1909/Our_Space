import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./assets/styles/globals.css";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import { CoupleProvider } from "./context/CoupleContext.jsx";
import { HealingProvider } from "./features/healingZone/context/HealingContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <UiProvider>
            <CoupleProvider>
              <HealingProvider>
                <App />
              </HealingProvider>
            </CoupleProvider>
          </UiProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
