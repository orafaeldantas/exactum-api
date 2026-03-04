import Navbar from "../components/Navbar/Navbar"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function Dashboard() {
  const { user } = useContext(AuthContext)

  return (
    <>
      <Navbar />

      <div style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>

        {user && (
          <>
            <p>ID: {user.id}</p>
            <p>
              Tipo de conta:{" "}
              {user.is_admin ? "Administrador" : "Usuário comum"}
            </p>
          </>
        )}
      </div>
    </>
  )
}

export default Dashboard