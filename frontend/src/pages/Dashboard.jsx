import Navbar from "../components/Navbar/Navbar"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function Dashboard() {
  const { user } = useContext(AuthContext)

  return (
    <>

      <div style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>

        {user && (
          <>
            <p>ID: {user.id}</p>
            <p>
              Tipo de conta:{user.role}
            </p>
          </>
        )}
      </div>
    </>
  )
}

export default Dashboard