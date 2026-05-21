import { useEffect, useState } from "react";
import {
  Monitor,
  Smartphone,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function checkDevice() {
      const isMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(
          navigator.userAgent
        );

      const smallScreen = window.innerWidth < 1024;

      setShow(isMobile || smallScreen);
    }

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () =>
      window.removeEventListener(
        "resize",
        checkDevice
      );
  }, []);

  if (!show) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-slate-950/70
        backdrop-blur-sm
        flex items-center justify-center
        px-6
      "
    >
      <div
        className="
          w-full
          max-w-lg
          bg-white
          rounded-3xl
          border
          border-gray-100
          shadow-2xl
          shadow-slate-900/10
          p-10
          text-center
          animate-in
          fade-in
          zoom-in
          duration-300
        "
      >
        {/* Ícone */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-20" />

          <div
            className="
              relative
              w-24 h-24
              rounded-full
              bg-amber-50
              border
              border-amber-100
              flex
              items-center
              justify-center
            "
          >
            <Smartphone className="w-10 h-10 text-amber-600" />

            <AlertTriangle
              className="
                absolute
                -bottom-1
                -right-1
                w-7
                h-7
                text-amber-500
              "
            />
          </div>
        </div>

        {/* Conteúdo */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Melhor experiência no computador
        </h1>

        <div className="space-y-4 mb-10">
          <p className="text-gray-600 leading-relaxed">
            O <span className="font-bold text-blue-600">
              Exactum
            </span>{" "}
            foi projetado principalmente para uso em
            desktop.
          </p>

          <div
            className="
              bg-blue-50
              border
              border-blue-100
              rounded-2xl
              p-5
            "
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-blue-600" />

              <span className="font-semibold text-blue-700">
                Recomendação
              </span>
            </div>

            <p className="text-sm text-blue-700">
              Algumas funcionalidades, tabelas e
              dashboards podem ter limitações em
              dispositivos menores.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShow(false)}
            className="
              group
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-slate-900
              text-white
              py-4
              rounded-2xl
              font-bold
              hover:bg-slate-800
              transition-all
              active:scale-[0.98]
            "
          >
            Continuar mesmo assim

            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => window.history.back()}
            className="
              py-3
              rounded-2xl
              border
              border-gray-200
              text-gray-600
              hover:bg-gray-50
              transition
            "
          >
            Voltar
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Para melhor produtividade, utilize notebook
          ou computador.
        </p>
      </div>
    </div>
  );
}