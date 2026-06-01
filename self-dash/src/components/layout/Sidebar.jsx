import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  IconTemplates,
  IconGroups,
  IconUsers,
  IconDefaults,
  IconFund,
  IconFinance,
  IconLogout,
} from '../icons'

const navItems = [
  { to: '/finance', label: 'المالية والإيرادات', icon: IconFinance },
  { to: '/group-templates', label: 'قوالب المجموعات', icon: IconTemplates },
  { to: '/groups', label: 'المجموعات', icon: IconGroups },
  { to: '/users', label: 'المستخدمون والملفات', icon: IconUsers },
  { to: '/defaults', label: 'حالات التعثر', icon: IconDefaults },
  { to: '/emergency-fund', label: 'صندوق الطوارئ', icon: IconFund },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 bg-surface-900 border-l border-surface-700 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <span className="text-white font-bold text-lg">س</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">سلفة</h1>
            <p className="text-xs text-slate-500">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent-500/15 text-accent-400 border border-accent-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-surface-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-slate-300">{user?.username}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <IconLogout className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
