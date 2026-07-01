import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import GlobalLoader from "./components/Loader/GlobalLoader";

// Layouts and Security Routes
import Layout from "./layouts/MainLayout";
import InfoLayout from "./layouts/InfoLayout"; 
import RoleRoute from "./routes/RoleRoute";

// ======= On-Demand Loading (Lazy Pages) =======
// Public & Institutional
const Home = lazy(() => import("./pages/home/Home"));
const AboutPage = lazy(() => import("./pages/informations/AboutPage"));
const PrivacyPage = lazy(() => import("./pages/informations/Privacy"));
const TermsPage = lazy(() => import("./pages/informations/Terms"));

// Authentication
const Login = lazy(() => import("./pages/auth/Login"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Tenants / Onboarding
const CreateTenant = lazy(() => import("./pages/tenants/CreateTenant"));
const SuccessPage = lazy(() => import("./pages/tenants/SuccessPage"));

// Dashboard & Metrics
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const RevenuePeriod = lazy(() => import("./pages/revenue/RevenuePeriod"));
const AverageTicketAnalytics = lazy(() => import("./pages/revenue/AverageTicket"));

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


function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: { background: "#1e293b", color: "#fff" }
        }}
      />

      <Suspense fallback={<GlobalLoader message="Carregando Exactum..." />}>
        <Routes>
          
          {/* 1. PUBLIC / INSTITUTIONAL ROUTES */}
          <Route element={<InfoLayout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/create-tenant" element={<CreateTenant />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/login" element={<Login />} />

          {/* 2. PROTECTED ROUTES WITHOUT GLOBAL LAYOUT */}
          <Route element={<RoleRoute requiredRole={"sale:create"} />}>
            <Route path="/checkout" element={<LocalSales />} />
          </Route>
          <Route element={<RoleRoute requiredRole={"profile:update"} />}>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* 3. INTERNAL SYSTEM (DASHBOARD & BACK OFFICE WITH LAYOUT AND SESSION FILTER) */}
          <Route element={<RoleRoute><Layout /></RoleRoute>}>
            
            <Route element={<RoleRoute requiredRole={"analytics:view"} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Sub-block: Billing (Admin / Super Admin) */}
            <Route element={<RoleRoute requiredRole={"analytics:view"} />}>
              <Route path="/revenue" element={<RevenuePeriod />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"analytics:view"} />}>
              <Route path="/average-ticket" element={<AverageTicketAnalytics />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"sale:view"} />}>
              <Route path="/products-sales" element={<ListProductsSales />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"sale:view"} />}>
              <Route path="/sales" element={<ListSales />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"sale:view"} />}>
              <Route path="/sales/:uuid" element={<ListSaleItems />} />
            </Route>
            

            {/* Sub-block: User Control */}
            <Route element={<RoleRoute requiredRole={"user:view"} />}>
              <Route path="/users" element={<ListUsers />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"user:create"} />}>
              <Route path="/users/create" element={<CreateUser />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"user:update"} />}>
              <Route path="/users/edit/:uuid" element={<EditUser />} />
            </Route>
            

            {/* Sub-block: Products (Accessible to all authenticated users, except editors) */}
            <Route element={<RoleRoute requiredRole={"product:view"} />}>
              <Route path="/products" element={<ListProducts />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"product:update"} />}>
              <Route path="/low-stock" element={<LowStockProducts />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"product:create"} />}>
              <Route path="/products/create" element={<CreateProduct />} />
            </Route>
            <Route element={<RoleRoute requiredRole={"product:update"} />}>
              <Route path="/product/edit/:uuid" element={<EditProduct />} />
            </Route>

            {/* Sub-block: Critical Settings and Levels */}
            <Route path="/user-settings" element={<RoleRoute requiredRole={"profile:view"}><UserSettings /></RoleRoute>} />
            <Route path="/admin-settings" element={<RoleRoute requiredRole={"tenant:update"}><AdminSettings /></RoleRoute>} />

            {/* Sub-block: Super Admin Control */}
            <Route path="/system/manage-companies" element={<RoleRoute requiredRole={"super-admin"}><ManageCompanies /></RoleRoute>} />
            <Route path="/system/dashboard" element={<RoleRoute requiredRole={"super-admin"}><SystemDashboard /></RoleRoute>} />
            <Route path="/system/infra-health" element={<RoleRoute requiredRole={"super-admin"}><InfraHealth /></RoleRoute>} />
            <Route path="/system/logs" element={<RoleRoute requiredRole={"super-admin"}><SystemLogs /></RoleRoute>} />

          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;


/*
PERMISSIONS = [
    "product:view",
    "product:create",
    "product:update",
    "product:delete",
    "sale:view",
    "sale:create",
    "sale:cancel",
    "user:view",
    "user:create",
    "user:update",
    "user:delete",
    "profile:view",
    "profile:update",
    "tenant:view",
    "tenant:update",
    "analytics:view",
    "inventory:view",
    "inventory:update",
    "goal:view",
    "goal:create",
    "goal:update",
    "goal:delete",
    "rbac:view",
]
*/