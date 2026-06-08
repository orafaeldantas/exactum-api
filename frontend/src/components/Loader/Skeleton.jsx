export default function Skeleton({ className = "" }) {
    return (
      <div 
        className={`animate-pulse bg-slate-200 rounded ${className}`} 
      />
    );
  }