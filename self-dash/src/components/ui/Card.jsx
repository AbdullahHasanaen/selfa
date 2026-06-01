export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-surface-800/60 border border-surface-700 rounded-xl ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'accent' }) {
  const accents = {
    accent: 'from-accent-500/20 to-accent-600/5 border-accent-500/20 text-accent-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`bg-gradient-to-br ${accents[accent]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg bg-surface-800/80 ${accents[accent].split(' ').pop()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
