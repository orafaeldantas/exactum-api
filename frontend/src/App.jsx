import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoleRoute from "./routes/RoleRoute";
import CreateUser from "./pages/CreateUser";
import MainLayout from "./layouts/MainLayout";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RoleRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/users"
        element={
          <RoleRoute>
            <MainLayout>
              <CreateUser />
            </MainLayout>
          </RoleRoute>
        }
      />
      
    </Routes>
  );
}

export default App;