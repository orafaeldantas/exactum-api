import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Box,
  Eye,
  EyeOff,
  FlaskConical,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  Sparkles,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const VALUE_PROPS = [
  "Centralize todo o seu estoque em um único painel, sem planilhas soltas.",
  "Prepare-se para antecipar rupturas antes que elas aconteçam.",
  "Decisões de reposição guiadas por dados, não por intuição.",
  "Uma base sólida para crescer sem perder o controle da operação.",
];

/** Dark-panel particle network — same visual language of the landing page, adapted for a deep blue background. */
function ParticleNetwork() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const LINE_RGB = "147, 197, 253"; // blue-300
    const NODE_COLORS = ["#bfdbfe", "#93c5fd", "#60a5fa", "#ffffff"];

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let animationId = null;
    const mouse = { x: 0, y: 0, active: false };

    function initParticles() {
      const count = Math.min(
        70,
        Math.max(30, Math.floor((width * height) / 8500))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 1.3,
        color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      }));
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy) || 1;
            const repelRadius = 80;
            if (dist < repelRadius) {
              const force = (repelRadius - dist) / repelRadius;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }
        }
      });

      const linkDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${
              (1 - dist / linkDist) * 0.25
            })`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(draw);
    }

    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handleMouseLeave() {
      mouse.active = false;
    }

    resize();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const rotatorRef = useRef(null);

  useEffect(() => {
    startRotator();
    return () => clearInterval(rotatorRef.current);
  }, []);

  function startRotator() {
    clearInterval(rotatorRef.current);
    rotatorRef.current = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % VALUE_PROPS.length);
    }, 4500);
  }

  function goToPhrase(i) {
    setPhraseIndex(i);
    startRotator();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      await login();
    } catch (err) {
      if (err.status == 401) {
        setError("Credenciais inválidas.");
      }
      if (err.status == 422) {
        setError("Por favor, preencha todos os campos com dados válidos.");
      }
      if (err.status == 403 && err.data.error === "company_blocked") {
        setError("A empresa associada a este usuário está suspensa.");
      }
      if (err.status == 403 && err.data.error === "user_blocked") {
        setError("Seu usuário está bloqueado.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Local keyframes — kept scoped to this page */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -10px); }
        }
        .fade-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .fade-in, .float-slow { animation: none !important; }
        }
      `}</style>

      {/* MOBILE-ONLY compact brand strip (right panel is hidden below lg) */}
      <div className="flex items-center justify-between px-6 py-4 lg:hidden absolute top-0 left-0 right-0 z-10">
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Box className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Exactum
          </span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* LEFT — form */}
      <div className="relative flex w-full flex-col justify-center px-6 pt-20 pb-10 sm:px-12 lg:w-[46%] lg:pt-10 xl:w-[42%] xl:px-20">
        {/* Desktop header: logo + back link */}
        <div className="mb-10 hidden items-center justify-between lg:flex">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/10">
              <Box className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Exactum
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="fade-up mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Entre com suas credenciais para acessar seu painel.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {/* Campo E-mail */}
            <div className="relative">
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="exemplo@exactum.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Senha
                </label>
                <span
                  title="Disponível em breve"
                  className="cursor-not-allowed text-xs font-semibold text-slate-300"
                >
                  Esqueceu a senha?
                </span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="fade-in flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3),0_16px_32px_-12px_rgba(37,99,235,0.25)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35),0_20px_40px_-12px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3),0_16px_32px_-12px_rgba(37,99,235,0.25)]"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ainda não tem uma empresa cadastrada?{" "}
            <Link
              to="/create-tenant"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Criar agora
            </Link>
          </p>
        </div>

        <p className="mx-auto mt-10 w-full max-w-sm text-center text-xs text-slate-400 lg:mt-16">
          &copy; 2026 Exactum Tecnologia. Todos os direitos reservados.
        </p>
      </div>

      {/* RIGHT — brand panel, hidden on mobile */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 lg:flex lg:w-[54%] xl:w-[58%]">
        <ParticleNetwork />

        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_BG }}
        />

        {/* Soft vignette so text stays legible over the network */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 30% 30%, rgba(29,78,216,0.35), transparent 60%)",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          {/* Top: alpha badge */}
          <div className="fade-up inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
            <FlaskConical className="h-3.5 w-3.5" />
            Versão Alpha - construindo em público
          </div>

          {/* Middle: headline + rotating value props */}
          <div className="max-w-lg">
            <h2
              className="fade-up text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              Sua operação sob controle total.
            </h2>

            <div className="mt-8 h-[72px]">
              <p
                key={phraseIndex}
                className="fade-in text-lg leading-relaxed text-blue-100"
              >
                {VALUE_PROPS[phraseIndex]}
              </p>
            </div>

            {/* Dot indicators */}
            <div className="mt-6 flex gap-2">
              {VALUE_PROPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPhrase(i)}
                  aria-label={`Ver frase ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === phraseIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Feature checklist */}
            <div className="mt-12 flex flex-col gap-4">
              <div className="float-slow flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-blue-50">
                  Gestão centralizada da operação
                </span>
              </div>
              <div
                className="float-slow flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <Bell className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-blue-50">
                  Alertas inteligentes de estoque
                </span>
              </div>
              <div
                className="float-slow flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                style={{ animationDelay: "2.4s" }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-blue-50">
                  Previsão de demanda com IA{" "}
                  <span className="text-blue-300"> (em breve)</span>
                </span>
              </div>
            </div>
          </div>

          <p
            className="fade-up text-xs text-blue-200/70"
            style={{ animationDelay: "160ms" }}
          >
            Exactum Tecnologia · Construído para empresas que querem crescer com
            dados.
          </p>
        </div>
      </div>
    </div>
  );
}
