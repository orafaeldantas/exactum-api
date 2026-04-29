import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./features/home/Home";
import CreateTenant from "./features/tenant/pages/CreateTenant";
import SuccessPage from "./features/tenant/pages/SuccessPage";
import ManageCompanies from "./features/manage/ManageCompanies";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import ListUsers from "./pages/ListUsers";
import EditUser from "./pages/EditUser";
import LocalSales from "./pages/LocalSales";

import Layout from "./layouts/MainLayout";
import RoleRoute from "./routes/RoleRoute";
import ListProducts from "./pages/ListProducts";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import ResetPassword from "./pages/ResetPassword";


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
          
        <Route path="/" element={<Home />} />
        <Route path="/create-tenant" element={<CreateTenant />} />
        <Route path="/success" element={<SuccessPage />} />

        <Route path="/login" element={<Login />} />
        

        <Route
            path="/checkout"
            element={
              <RoleRoute>
                <LocalSales />
              </RoleRoute>
            }
          />

        <Route path="/reset-password" 
            element={
              <RoleRoute>
                <ResetPassword />
              </RoleRoute>
            } 
        />
        
        <Route
          element={
              <RoleRoute>
                <Layout />
              </RoleRoute>
          }
        >

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/manage-companies"
            element={
              <RoleRoute requiredRole={["super-admin"]}>
                <ManageCompanies />
              </RoleRoute>
            }
          />

          <Route
            path="/users"
            element={
              <RoleRoute requiredRole={["admin", "super-admin"]}>
                <ListUsers />
              </RoleRoute>
            }
          />

         

          <Route
            path="/users/create"
            element={
              <RoleRoute requiredRole={["admin", "super-admin"]}>
                <CreateUser />
              </RoleRoute>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <RoleRoute requiredRole={["admin", "super-admin"]}>
                <EditUser />
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
            path="/products/create"
            element={
              <RoleRoute>
                <CreateProduct />
              </RoleRoute>
            }
          />

          <Route
            path="/product/edit/:id"
            element={
              <RoleRoute requiredRole={["admin", "super-admin"]}>
                <EditProduct />
              </RoleRoute>
            }
          />

        </Route>

      </Routes>

    </>
  );
}

export default App;