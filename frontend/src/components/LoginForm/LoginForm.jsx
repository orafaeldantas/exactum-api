import { useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import { loginRequest } from "../../services/auth"
import { AuthContext } from "../../context/AuthContext"
import { Mail, Lock, LogIn, AlertCircle, CircleDot } from "lucide-react"

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
    } catch (err) {
      setError(err.message || "Credenciais inválidas")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/50">
        
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <CircleDot className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Exactum <span className="text-blue-600">Pro</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Acesse sua plataforma de gestão
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo E-mail */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="exemplo@exactum.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Entrar */}
          <button 
            type="submit" 
            disabled={loading} 
            className="
              flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 
              text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all 
              hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; 2026 Exactum Tecnologia. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}