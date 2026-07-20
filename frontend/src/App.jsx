import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";

import GlobalLoader from "./components/Loader/GlobalLoader";

// Layouts and Security Routes
import InfoLayout from "./layouts/InfoLayout";
import Layout from "./layouts/MainLayout";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// ======= On-Demand Loading (Lazy Pages) =======
// Public & Institutional
const Home = lazy(() => import("./pages/home/Home"));
const AboutPage = lazy(() => import("./pages/informations/AboutPage"));
const PrivacyPage = lazy(() => import("./pages/informations/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/informations/TermsPage"));
const SupportPage = lazy(() => import("./pages/informations/SupportPage"));

// Authentication
const Login = lazy(() => import("./pages/auth/Login"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Tenants / Onboarding
const CreateTenant = lazy(() => import("./pages/tenants/CreateTenant"));
const SuccessPage = lazy(() => import("./pages/tenants/SuccessPage"));

// Dashboard & Metrics
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const RevenuePeriod = lazy(() => import("./pages/revenue/RevenuePeriod"));
const AverageTicketAnalytics = lazy(() =>
  import("./pages/revenue/AverageTicket")
);

// Logs
const AuditLogs = lazy(() => import("./pages/logs-tenant/AuditLogs"));

// Sales & PDV
const LocalSales = lazy(() => import("./pages/pdv/LocalSales"));
const ListSales = lazy(() => import("./pages/sales/ListSales"));
const ListSaleItems = lazy(() => import("./pages/sales/ListSaleItems"));
const ListProductsSales = lazy(() => import("./pages/sales/ListProductsSales"));

// Products
const ListProducts = lazy(() => import("./pages/products/ListProducts"));
const CreateProduct = lazy(() => import("./pages/products/CreateProduct"));
const EditProduct = lazy(() => import("./pages/products/EditProduct"));
const LowStockProducts = lazy(() => import("./pages/products/LowStock"));

// Users & Management
const ListUsers = lazy(() => import("./pages/users/ListUsers"));
const CreateUser = lazy(() => import("./pages/users/CreateUser"));
const EditUser = lazy(() => import("./pages/users/EditUser"));

// Settings
const UserSettings = lazy(() => import("./pages/settings/UserSettings"));
const AdminSettings = lazy(() => import("./pages/settings/AdminSettings"));

// Platform (system)
const ManageCompanies = lazy(() => import("./pages/platform/ManageCompanies"));
const SystemDashboard = lazy(() => import("./pages/platform/SystemDashboard"));
const InfraHealth = lazy(() => import("./pages/platform/InfraHealth"));
const SystemLogs = lazy(() => import("./pages/platform/SystemLogs"));
const PlatformEvents = lazy(() => import("./pages/platform/PlatformEvents"));

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: "#1e293b", color: "#fff" },
        }}
      />

      <Suspense fallback={<GlobalLoader message="Carregando..." />}>
        <Routes>
          {/* 1. PUBLIC / INSTITUTIONAL ROUTES */}
          <Route element={<InfoLayout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/create-tenant" element={<CreateTenant />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* 2. PROTECTED ROUTES WITHOUT GLOBAL LAYOUT */}
          <Route element={<PrivateRoute requiredRole={"sale:create"} />}>
            <Route path="/checkout" element={<LocalSales />} />
          </Route>
          <Route element={<PrivateRoute requiredRole={"profile:update"} />}>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* 3. INTERNAL SYSTEM (DASHBOARD & BACK OFFICE WITH LAYOUT AND SESSION FILTER) */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route element={<PrivateRoute requiredRole={"analytics:view"} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"logs:view"} />}>
              <Route path="/logs" element={<AuditLogs />} />
            </Route>

            {/* Sub-block: Billing (Admin / Super Admin) */}
            <Route element={<PrivateRoute requiredRole={"analytics:view"} />}>
              <Route path="/revenue" element={<RevenuePeriod />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"analytics:view"} />}>
              <Route
                path="/average-ticket"
                element={<AverageTicketAnalytics />}
              />
            </Route>
            <Route element={<PrivateRoute requiredRole={"sale:view"} />}>
              <Route path="/products-sales" element={<ListProductsSales />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"sale:view"} />}>
              <Route path="/sales" element={<ListSales />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"sale:view"} />}>
              <Route path="/sales/:uuid" element={<ListSaleItems />} />
            </Route>

            {/* Sub-block: User Control */}
            <Route element={<PrivateRoute requiredRole={"user:view"} />}>
              <Route path="/users" element={<ListUsers />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"user:create"} />}>
              <Route path="/users/create" element={<CreateUser />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"user:update"} />}>
              <Route path="/users/edit/:uuid" element={<EditUser />} />
            </Route>

            {/* Sub-block: Products (Accessible to all authenticated users, except editors) */}
            <Route element={<PrivateRoute requiredRole={"product:view"} />}>
              <Route path="/products" element={<ListProducts />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"product:update"} />}>
              <Route path="/low-stock" element={<LowStockProducts />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"product:create"} />}>
              <Route path="/products/create" element={<CreateProduct />} />
            </Route>
            <Route element={<PrivateRoute requiredRole={"product:update"} />}>
              <Route path="/product/edit/:uuid" element={<EditProduct />} />
            </Route>

            {/* Sub-block: Critical Settings and Levels */}
            <Route
              path="/user-settings"
              element={
                <PrivateRoute requiredRole={"profile:view"}>
                  <UserSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-settings"
              element={
                <PrivateRoute requiredRole={"tenant:update"}>
                  <AdminSettings />
                </PrivateRoute>
              }
            />

            {/* Sub-block: Super Admin Control */}
            <Route
              path="/platform/manage-companies"
              element={
                <PrivateRoute requiredRole={"super-admin"}>
                  <ManageCompanies />
                </PrivateRoute>
              }
            />
            <Route
              path="/platform/dashboard"
              element={
                <PrivateRoute requiredRole={"super-admin"}>
                  <SystemDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/platform/infra-health"
              element={
                <PrivateRoute requiredRole={"super-admin"}>
                  <InfraHealth />
                </PrivateRoute>
              }
            />
            <Route
              path="/platform/logs"
              element={
                <PrivateRoute requiredRole={"super-admin"}>
                  <SystemLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/platform/events"
              element={
                <PrivateRoute requiredRole={"super-admin"}>
                  <PlatformEvents />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
