export default function LoadingOverlay({ loading, children, message = "Atualizando..." }) {
    return (

      <div className="relative h-full w-full flex flex-col">
        
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <span className="text-sm font-medium text-gray-600">{message}</span>
            </div>
          </div>
        )}
  
        <div 
          className={`flex-1 overflow-y-auto transition-opacity duration-300 ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          {children}
        </div>
        
      </div>
    );
  }