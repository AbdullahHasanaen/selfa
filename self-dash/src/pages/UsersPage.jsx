import { useState, useCallback } from 'react'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSalfaUsers,
  createSalfaUser,
} from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD } from '../utils/formatters'
import { getApiError } from '../utils/apiError'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { ACCOUNT_STATUS } from '../constants/statuses'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Modal, { ConfirmDialog } from '../components/ui/Modal'

const emptyIdentityForm = {
  username: '',
  password: '',
  newPassword: '',
  currentPassword: '',
  role: 'User',
}

const emptySalfaForm = {
  username: '',
  password: '',
  fullName: '',
  phoneNumber: '',
  salaryAmount: '',
}

export default function UsersPage() {
  const [tab, setTab] = useState('users')
  const [identityModal, setIdentityModal] = useState(null)
  const [salfaModal, setSalfaModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [identityForm, setIdentityForm] = useState(emptyIdentityForm)
  const [salfaForm, setSalfaForm] = useState(emptySalfaForm)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchUsersData = useCallback(async () => {
    const [usersRes, salfaRes] = await Promise.all([getUsers(), getSalfaUsers()])
    return {
      users: Array.isArray(usersRes.data) ? usersRes.data : [],
      salfaUsers: Array.isArray(salfaRes.data) ? salfaRes.data : [],
    }
  }, [])

  const { data, loading, refetch } = useFetch(fetchUsersData)
  const users = data?.users || []
  const salfaUsers = data?.salfaUsers || []

  const openCreateIdentity = () => {
    setIdentityForm(emptyIdentityForm)
    setIdentityModal('create')
  }

  const openEditIdentity = (user) => {
    setIdentityForm({
      username: user.username,
      password: '',
      newPassword: '',
      currentPassword: '',
      role: user.roles?.[0] || 'User',
    })
    setIdentityModal({ type: 'edit', id: user.id })
  }

  const handleIdentitySubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (identityModal === 'create') {
        await createUser({
          username: identityForm.username,
          password: identityForm.password,
          role: identityForm.role,
        })
        toast.success('تم إنشاء المستخدم')
      } else {
        const payload = {}
        if (identityForm.username) payload.username = identityForm.username
        if (identityForm.newPassword) {
          payload.currentPassword = identityForm.currentPassword
          payload.newPassword = identityForm.newPassword
        }
        await updateUser(identityModal.id, payload)
        toast.success('تم تحديث المستخدم')
      }
      setIdentityModal(null)
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل حفظ المستخدم'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSalfaSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createSalfaUser({
        username: salfaForm.username,
        password: salfaForm.password,
        fullName: salfaForm.fullName,
        phoneNumber: salfaForm.phoneNumber,
        salaryAmount: Number(salfaForm.salaryAmount),
      })
      toast.success('تم إنشاء مستخدم سلفة')
      setSalfaModal(false)
      setSalfaForm(emptySalfaForm)
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل إنشاء مستخدم سلفة'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deleteUser(deleteTarget.id)
      toast.success('تم حذف المستخدم')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل حذف المستخدم'))
    } finally {
      setSubmitting(false)
    }
  }

  const accountBadge = (status) => {
    const cfg = ACCOUNT_STATUS[status] || { label: status, variant: 'default' }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const userColumns = [
    { key: 'username', header: 'اسم المستخدم' },
    {
      key: 'roles',
      header: 'الدور',
      render: (row) => (
        <div className="flex gap-1">
          {(row.roles || []).map((role) => (
            <Badge key={role} variant="info">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={() => openEditIdentity(row)}>
            تعديل
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            حذف
          </Button>
        </div>
      ),
    },
  ]

  const salfaColumns = [
    { key: 'username', header: 'اسم المستخدم' },
    { key: 'fullName', header: 'الاسم الكامل' },
    { key: 'phoneNumber', header: 'رقم الهاتف' },
    {
      key: 'salaryAmount',
      header: 'الراتب',
      render: (row) => formatIQD(row.salaryAmount),
    },
    {
      key: 'maxCapacity',
      header: 'السعة القصوى',
      render: (row) => formatIQD(row.maxCapacity),
    },
    {
      key: 'usedCapacity',
      header: 'المستخدمة',
      render: (row) => formatIQD(row.usedCapacity),
    },
    {
      key: 'remainingCapacity',
      header: 'المتبقية',
      render: (row) => formatIQD(row.remainingCapacity),
    },
    {
      key: 'accountStatus',
      header: 'حالة الحساب',
      render: (row) => accountBadge(row.accountStatus),
    },
    {
      key: 'isRestricted',
      header: 'مقيّد',
      render: (row) =>
        row.isRestricted ? (
          <Badge variant="warning">{row.restrictionReason || 'نعم'}</Badge>
        ) : (
          <Badge variant="success">لا</Badge>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="المستخدمون وملفات سلفة"
        subtitle="إدارة حسابات الدخول وملفات سلفة"
        action={
          tab === 'users' ? (
            <Button onClick={openCreateIdentity}>إضافة مستخدم</Button>
          ) : (
            <Button onClick={() => setSalfaModal(true)}>إضافة مستخدم سلفة</Button>
          )
        }
      />

      <div className="flex gap-2 mb-6">
        {[
          { key: 'users', label: 'حسابات الدخول' },
          { key: 'salfa', label: 'ملفات سلفة' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === key
                ? 'bg-accent-500/15 text-accent-400 border border-accent-500/20'
                : 'text-slate-400 hover:bg-surface-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <TableSkeleton cols={5} />
        ) : (
          <DataTable
            columns={tab === 'users' ? userColumns : salfaColumns}
            data={tab === 'users' ? users : salfaUsers}
          />
        )}
      </Card>

      <Modal
        open={!!identityModal}
        onClose={() => setIdentityModal(null)}
        title={identityModal === 'create' ? 'إضافة مستخدم' : 'تعديل مستخدم'}
      >
        <form onSubmit={handleIdentitySubmit} className="space-y-4">
          <Input
            label="اسم المستخدم"
            value={identityForm.username}
            onChange={(e) => setIdentityForm({ ...identityForm, username: e.target.value })}
            required
          />
          {identityModal === 'create' ? (
            <>
              <Input
                label="كلمة المرور"
                type="password"
                value={identityForm.password}
                onChange={(e) => setIdentityForm({ ...identityForm, password: e.target.value })}
                required
              />
              <Select
                label="الدور"
                value={identityForm.role}
                onChange={(e) => setIdentityForm({ ...identityForm, role: e.target.value })}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </Select>
            </>
          ) : (
            <>
              <Input
                label="كلمة المرور الحالية"
                type="password"
                value={identityForm.currentPassword}
                onChange={(e) => setIdentityForm({ ...identityForm, currentPassword: e.target.value })}
              />
              <Input
                label="كلمة المرور الجديدة"
                type="password"
                value={identityForm.newPassword}
                onChange={(e) => setIdentityForm({ ...identityForm, newPassword: e.target.value })}
              />
            </>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setIdentityModal(null)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={salfaModal}
        onClose={() => setSalfaModal(false)}
        title="إضافة مستخدم سلفة"
      >
        <form onSubmit={handleSalfaSubmit} className="space-y-4">
          <Input
            label="اسم المستخدم"
            value={salfaForm.username}
            onChange={(e) => setSalfaForm({ ...salfaForm, username: e.target.value })}
            required
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={salfaForm.password}
            onChange={(e) => setSalfaForm({ ...salfaForm, password: e.target.value })}
            required
          />
          <Input
            label="الاسم الكامل"
            value={salfaForm.fullName}
            onChange={(e) => setSalfaForm({ ...salfaForm, fullName: e.target.value })}
            required
          />
          <Input
            label="رقم الهاتف"
            value={salfaForm.phoneNumber}
            onChange={(e) => setSalfaForm({ ...salfaForm, phoneNumber: e.target.value })}
            required
          />
          <Input
            label="الراتب (د.ع)"
            type="number"
            value={salfaForm.salaryAmount}
            onChange={(e) => setSalfaForm({ ...salfaForm, salaryAmount: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setSalfaModal(false)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إنشاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف المستخدم "${deleteTarget?.username}"؟`}
        confirmLabel="حذف"
        danger
        loading={submitting}
      />
    </>
  )
}
