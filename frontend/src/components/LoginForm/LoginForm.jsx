import { useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import styles from './LoginForm.module.css'
import { loginRequest } from "../../services/auth"
import { AuthContext } from "../../context/AuthContext"

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest(email, password)

      await login(data.access_token)
      navigate("/dashboard")   

      console.log("Login realizado com sucesso")

      
    } catch (err) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Estoque Pro</h1>
      <p className={styles.subtitle}>
        Acesse sua plataforma de gestão
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <span className={styles.error}>{error}</span>}

        <button type="submit" disabled={loading} className={styles.buttonLogin}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}