export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} border-white/5 border-t-emerald rounded-full animate-spin shadow-glass ring-1 ring-white/5`}
        aria-label="Loading"
      />
    </div>
  );
}
