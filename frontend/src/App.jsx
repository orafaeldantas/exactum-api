import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoleRoute from "./routes/RoleRoute";
import CreateUser from "./pages/CreateUser";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RoleRoute>
            <Dashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/users"
        element={
          <RoleRoute>
            <CreateUser />
          </RoleRoute>
        }
      />
      
    </Routes>
  );
}

export default App;