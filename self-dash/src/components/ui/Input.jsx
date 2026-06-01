export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-400">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-400">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-colors cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-400">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-colors resize-none ${error ? 'border-red-500' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
