import { useState, useEffect, useRef } from "react";

export default function LoadingOverlay({ loading, children, message = "Atualizando...", minDuration = 0 }) {
  const [showOverlay, setShowOverlay] = useState(loading);
  const shownAt = useRef(loading ? Date.now() : null);

  useEffect(() => {
    if (loading) {
      shownAt.current = Date.now();
      setShowOverlay(true);
    } else {
      const elapsed = shownAt.current ? Date.now() - shownAt.current : 0;
      const remaining = Math.max(0, minDuration - elapsed);
      const timer = setTimeout(() => setShowOverlay(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading, minDuration]);

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className={`absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[2px] transition-opacity duration-200 ${
        showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <span className="text-sm font-medium text-gray-600">{message}</span>
        </div>
      </div>
      <div className={`flex-1 min-h-0 transition-opacity duration-200 ${
        showOverlay ? "opacity-40 pointer-events-none" : "opacity-100"
      }`}>
        {children}
      </div>
    </div>
  );
}