import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
const ManageCompanies = lazy(() => import("./pages/manage/ManageCompanies"));

// Settings
const UserSettings = lazy(() => import("./pages/settings/UserSettings"));
const AdminSettings = lazy(() => import("./pages/settings/AdminSettings"));


const PageLoader = () => <div 
  className="h-screen w-screen bg-slate-50 
             flex items-center justify-center 
             text-sm text-slate-500 font-medium 
             animate-pulse">
             Carregando ambiente...
</div>;

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

      <Suspense fallback={<PageLoader />}>
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
          <Route path="/checkout" element={<RoleRoute><LocalSales /></RoleRoute>} />
          <Route path="/reset-password" element={<RoleRoute><ResetPassword /></RoleRoute>} />
          
          {/* 3. INTERNAL SYSTEM (DASHBOARD & BACK OFFICE WITH LAYOUT AND SESSION FILTER) */}
          <Route element={<RoleRoute><Layout /></RoleRoute>}>
            
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Sub-block: Billing (Admin / Super Admin) */}
            <Route element={<RoleRoute requiredRole={["admin", "super-admin"]} />}>
              <Route path="/revenue" element={<RevenuePeriod />} />
              <Route path="/average-ticket" element={<AverageTicketAnalytics />} />
              <Route path="/products-sales" element={<ListProductsSales />} />
              <Route path="/sales" element={<ListSales />} />
              <Route path="/sales/:id" element={<ListSaleItems />} />
            </Route>

            {/* Sub-block: User Control */}
            <Route element={<RoleRoute requiredRole={["admin", "super-admin"]} />}>
              <Route path="/users" element={<ListUsers />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
            </Route>

            {/* Sub-block: Products (Accessible to all authenticated users, except editors) */}
            <Route path="/products" element={<ListProducts />} />
            <Route path="/low-stock" element={<LowStockProducts />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/product/edit/:id" element={<RoleRoute requiredRole={["admin", "super-admin"]}><EditProduct /></RoleRoute>} />

            {/* Sub-block: Critical Settings and Levels */}
            <Route path="/user-settings" element={<RoleRoute requiredRole={["user", "super-admin"]}><UserSettings /></RoleRoute>} />
            <Route path="/admin-settings" element={<RoleRoute requiredRole={["admin"]}><AdminSettings /></RoleRoute>} />
            <Route path="/manage-companies" element={<RoleRoute requiredRole={["super-admin"]}><ManageCompanies /></RoleRoute>} />

          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;