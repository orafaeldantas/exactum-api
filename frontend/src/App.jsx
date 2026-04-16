import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import CreateTenant from "./features/tenant/pages/CreateTenant";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import ListUsers from "./pages/ListUsers";
import EditUser from "./pages/EditUser";

import Layout from "./layouts/MainLayout";
import RoleRoute from "./routes/RoleRoute";
import ListProducts from "./pages/ListProducts";

import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
  return (
    <>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff"
          }
        }}
      />


      <Routes>

        <Route path="/create-tenant" element={<CreateTenant />} />

        <Route path="/" element={<Login />} />
        
        <Route
          element={
            <PrivateRoutes>
              <RoleRoute>
                <Layout />
              </RoleRoute>
            </PrivateRoutes>
          }
        >

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/users"
            element={
              <RoleRoute requiredRole="admin">
                <ListUsers />
              </RoleRoute>
            }
          />

          <Route
            path="/products"
            element={
              <RoleRoute>
                <ListProducts />
              </RoleRoute>
            }
          />

          <Route
            path="/users/create"
            element={
              <RoleRoute requiredRole="admin">
                <CreateUser />
              </RoleRoute>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <RoleRoute requiredRole="admin">
                <EditUser />
              </RoleRoute>
            }
          />

        </Route>

      </Routes>

    </>
  );
}

export default App;