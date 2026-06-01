import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }
    const result = await login(username, password)
    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح')
      navigate('/finance')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-accent-500/25">
            <span className="text-white font-bold text-2xl">س</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">سلفة</h1>
          <p className="text-slate-400 mt-1">لوحة إدارة نظام الادخار الدوار</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-800/60 border border-surface-700 rounded-xl p-6 space-y-5"
        >
          <Input
            label="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            autoComplete="username"
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="w-full">
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  )
}
