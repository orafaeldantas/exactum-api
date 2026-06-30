import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { TenantProvider } from "./context/TenantContext";
import { SuperAdminProvider } from "./context/SuperAdminContext";
import './styles/index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SuperAdminProvider>   
        <UserProvider>
          <TenantProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </TenantProvider>
        </UserProvider>
      </SuperAdminProvider>
    </BrowserRouter>
  </React.StrictMode>
);