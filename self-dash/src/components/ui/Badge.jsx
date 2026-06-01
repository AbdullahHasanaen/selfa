const variants = {
  default: 'bg-surface-700 text-slate-300 border-surface-600',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
}

export default function Badge({ children, variant = 'default', pulse = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${pulse ? 'animate-pulse-badge' : ''} ${className}`}
    >
      {children}
    </span>
  )
}
