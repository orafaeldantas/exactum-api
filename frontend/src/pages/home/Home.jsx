import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  BarChart3,
  Bell,
  LayoutDashboard,
  ArrowRight,
  FlaskConical,
  Play,
  Clock,
  TrendingUp,
  Lightbulb,
  Sparkles,
} from "lucide-react";

// Subtle film-grain texture (SVG fractal noise, data URI) — used at very low opacity
// to keep flat gradient backgrounds from looking synthetic/flat.
const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Reveals children with a fade + rise transition the first time they scroll into view. */
function useRevealOnView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/** Makes an element gently follow the cursor within a bounded offset — "magnetic button" feel. */
function useMagnetic(strength = 0.3, maxOffset = 10) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-maxOffset, Math.min(maxOffset, relX * strength));
      const y = Math.max(-maxOffset, Math.min(maxOffset, relY * strength));
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
    function reset() {
      el.style.transform = "translate(0px, 0px)";
    }

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, [strength, maxOffset]);

  return ref;
}

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const ctaRef = useMagnetic(0.25, 10);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleHeroMouseMove(e) {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      {/* Local keyframes — kept scoped to this page */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, 16px) scale(1.05); }
        }
        @keyframes floatBlobSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(14px, -10px) scale(1.03); }
        }
        @keyframes shimmerSweep {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .fade-up { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .blob-a { animation: floatBlob 9s ease-in-out infinite; }
        .blob-b { animation: floatBlobSlow 11s ease-in-out infinite; }
        .shimmer { position: relative; overflow: hidden; background: #e2e8f0; }
        .shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
          animation: shimmerSweep 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .blob-a, .blob-b, .shimmer::after { animation: none !important; }
        }
      `}</style>

      {/* ALPHA RIBBON */}
      <div className="w-full bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs font-medium tracking-wide">
          <FlaskConical className="h-3.5 w-3.5 text-blue-400" />
          <span>
            Exactum está em versão <span className="font-bold text-blue-400">Alpha</span> - algumas áreas ainda estão em construção.
          </span>
        </div>
      </div>

      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.15)]" : "border-gray-100 shadow-none"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link to="/dashboard" className="flex items-center gap-2.5 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/10">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Exactum</span>
            <span className="hidden sm:inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Alpha
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 py-1"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/create-tenant")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        style={{ "--spot-x": "50%", "--spot-y": "15%" }}
        className="relative overflow-hidden bg-gray-50/50 py-24 px-6"
      >
        {/* Ambient gradient blobs + cursor spotlight + grain */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-a absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="blob-b absolute top-10 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />

          {/* Subtle dot grid, evokes a data/ERP surface */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black 40%, transparent 100%)",
            }}
          />

          {/* Cursor-following spotlight */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 15%), rgba(37,99,235,0.10), transparent 45%)",
            }}
          />

          {/* Film grain */}
          <div
            className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{ backgroundImage: GRAIN_BG }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          {/* Left*/}
          <div className="text-center lg:text-left">
            <div
              className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              IA preditiva para estoque (em desenvolvimento)
            </div>

            <h2
              className="fade-up mb-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl leading-[1.1]"
              style={{ animationDelay: "80ms" }}
            >
              Controle seu estoque com <span className="text-blue-600">inteligência</span>
            </h2>

            <p
              className="fade-up mx-auto mb-10 max-w-xl text-lg text-slate-600 leading-relaxed lg:mx-0"
              style={{ animationDelay: "160ms" }}
            >
              Centralize sua operação hoje e prepare-se para prever demanda, evitar rupturas
              e maximizar o lucro com análise preditiva integrada à sua gestão diária.
            </p>

            <div
              className="fade-up flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
              style={{ animationDelay: "240ms" }}
            >
              <button
                ref={ctaRef}
                onClick={() => navigate("/create-tenant")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.35),0_24px_48px_-16px_rgba(37,99,235,0.35)] transition-shadow duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.4),0_32px_64px_-16px_rgba(37,99,235,0.4)] sm:w-auto outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Criar minha empresa
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <div className="relative w-full sm:w-auto">
                <span className="absolute -top-2.5 -right-2.5 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-sm">
                  <Clock className="h-2.5 w-2.5" />
                  Em breve
                </span>
                <button
                  disabled
                  title="Demonstração disponível em breve"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-lg font-bold text-slate-400 shadow-sm sm:w-auto"
                >
                  <Play className="w-5 h-5" />
                  Ver Demonstração
                </button>
              </div>
            </div>

            <p
              className="fade-up mt-6 text-xs font-medium text-slate-400"
              style={{ animationDelay: "300ms" }}
            >
              Teste gratuitamente.
            </p>
          </div>

          {/* Right: dashboard mockup */}
          <DashboardMockup />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-24 px-6 mx-auto max-w-7xl">
        <NeuralNetworkHeader className="mb-16 min-h-[220px] py-10 text-center">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Tudo o que você precisa</h3>
          <p className="mt-4 text-slate-500">Gestão simplificada hoje. Inteligência preditiva a caminho.</p>
        </NeuralNetworkHeader>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            index={0}
            icon={<BarChart3 className="w-6 h-6" />}
            title="Previsão de Demanda"
            description="Antecipe necessidades com base em histórico e tendências de mercado usando algoritmos preditivos."
            comingSoon
          />
          <FeatureCard
            index={1}
            icon={<Bell className="w-6 h-6" />}
            title="Alertas Inteligentes"
            description="Receba notificações em tempo real antes que o estoque acabe ou quando houver excesso de produtos."
          />
          <FeatureCard
            index={2}
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="Gestão Centralizada"
            description="Visualize toda sua operação em um dashboard intuitivo e tome decisões baseadas em dados reais."
          />
          <FeatureCard
            index={3}
            icon={<Lightbulb className="w-6 h-6" />}
            title="Dicas de Venda com IA"
            description="Receba sugestões automáticas de reposição e oportunidades de venda com base no comportamento do seu estoque."
            comingSoon
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50/50">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 opacity-70 select-none">
            <Box className="w-5 h-5" />
            <span className="font-bold">Exactum</span>
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              v0.1 Alpha
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 Exactum Tecnologia. Inteligência em cada unidade.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors duration-200">
              Privacidade
            </Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardMockup() {
  const [ref, inView] = useRevealOnView(0.3);
  const [loaded, setLoaded] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    if (!inView || loaded) return;

    const skeletonTimer = setTimeout(() => {
      setLoaded(true);
      const duration = 1100;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setRevenue(284910 * eased);
        setGrowth(12.4 * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 450);

    return () => clearTimeout(skeletonTimer);
  }, [inView, loaded]);

  return (
    <div
      ref={ref}
      className={`relative mx-auto w-full max-w-md transition-all duration-700 ease-out lg:max-w-none ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-8px_rgba(37,99,235,0.16),0_32px_64px_-24px_rgba(37,99,235,0.22)] transition-transform duration-500 hover:-rotate-1 hover:scale-[1.01]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estoque geral</p>
            {loaded ? (
              <p className="text-2xl font-extrabold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                R$ {Math.round(revenue).toLocaleString("pt-BR")}
              </p>
            ) : (
              <div className="mt-1.5 h-7 w-32 rounded-md shimmer" />
            )}
          </div>
          {loaded ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              +{growth.toFixed(1).replace(".", ",")}%
            </span>
          ) : (
            <div className="h-6 w-16 rounded-full shimmer" />
          )}
        </div>

        {/* Mini bar chart */}
        <div className="mb-5 flex h-32 items-end gap-2.5 rounded-xl bg-slate-50 p-4">
          {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-md bg-gradient-to-t from-blue-600 to-blue-400 transition-transform duration-700 ease-out"
              style={{
                height: `${h}%`,
                transform: inView ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "bottom",
                transitionDelay: `${300 + i * 80}ms`,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Giro médio</p>
            <p className="text-lg font-bold text-slate-800">6,2 dias</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-blue-500">
              <Sparkles className="h-3 w-3" /> Previsão IA
            </p>
            <p className="text-lg font-bold text-blue-700">Reposição em 4d</p>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-lg sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">3 alertas ativos</p>
          <p className="text-[11px] text-slate-400">Estoque baixo detectado</p>
        </div>
      </div>
    </div>
  );
}

function NeuralNetworkHeader({ className = "", children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const LINE_RGB = "37, 99, 235"; // blue-600
    const NODE_COLORS = ["#94a3b8", "#60a5fa", "#3b82f6", "#2563eb"]; // slate-400 -> blue-600

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let animationId = null;
    const mouse = { x: 0, y: 0, active: false };

    function initParticles() {
      const count = Math.min(60, Math.max(24, Math.floor((width * height) / 9000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 1.6,
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
            const repelRadius = 85;
            if (dist < repelRadius) {
              const force = (repelRadius - dist) / repelRadius;
              p.x += (dx / dist) * force * 1.1;
              p.y += (dy / dist) * force * 1.1;
            }
          }
        }
      });

      // proximity connections between particles
      const linkDist = 105;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${(1 - dist / linkDist) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        const grabDist = 130;
        particles.forEach((p) => {
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < grabDist) {
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${(1 - dist / grabDist) * 0.55})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.75;
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
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />

      {/* Edge fade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 75% 90% at 50% 50%, transparent 60%, white 100%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Feature card */
function FeatureCard({ icon, title, description, comingSoon = false, index = 0 }) {
  const [ref, inView] = useRevealOnView(0.15);

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-12px_rgba(15,23,42,0.08)] transition-all duration-500 ease-out hover:border-blue-100 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,23,42,0.02),0_20px_44px_-14px_rgba(37,99,235,0.2)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
    >
      {comingSoon && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
          <Clock className="h-2.5 w-2.5" />
          Em breve
        </span>
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-105">
        {icon}
      </div>
      <h4 className="mb-2 text-xl font-bold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-slate-600 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}