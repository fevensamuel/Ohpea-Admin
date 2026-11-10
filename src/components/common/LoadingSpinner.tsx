export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status">
      <div
        className={`${sizeMap[size]} border-slate-200 border-t-emerald-700 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && <p className="mt-3 text-xs font-medium text-slate-500">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
