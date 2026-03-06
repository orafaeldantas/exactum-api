import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";

import Layout from "./layouts/MainLayout";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        element={
          <RoleRoute>
            <Layout />
          </RoleRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/users"
          element={
            <RoleRoute requiredRole="admin">
              <CreateUser />
            </RoleRoute>
          }
        />
      </Route>

    </Routes>
  );
}

export default App;