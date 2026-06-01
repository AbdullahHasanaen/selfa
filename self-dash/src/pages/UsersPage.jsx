import { useState, useCallback } from 'react'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSalfaProfiles,
  updateSalfaProfile,
} from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { ACCOUNT_STATUS } from '../constants/statuses'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Modal, { ConfirmDialog } from '../components/ui/Modal'

const emptyUserForm = { username: '', fullName: '', phoneNumber: '', password: '', role: 'Member' }
const emptyProfileForm = { fullName: '', salaryAmount: '', usedCapacity: '', accountStatus: 'Active' }

export default function UsersPage() {
  const [tab, setTab] = useState('users')
  const [userModal, setUserModal] = useState(null)
  const [profileModal, setProfileModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [profileForm, setProfileForm] = useState(emptyProfileForm)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchUsersData = useCallback(async () => {
    const [usersRes, profilesRes] = await Promise.all([getUsers(), getSalfaProfiles()])
    return {
      users: Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.items || [],
      profiles: Array.isArray(profilesRes.data) ? profilesRes.data : profilesRes.data.items || [],
    }
  }, [])

  const { data, loading, refetch } = useFetch(fetchUsersData)
  const users = data?.users || []
  const profiles = data?.profiles || []

  const openCreateUser = () => {
    setUserForm(emptyUserForm)
    setUserModal('create')
  }

  const openEditUser = (user) => {
    setUserForm({
      username: user.username,
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
      role: user.role || 'Member',
    })
    setUserModal({ type: 'edit', id: user.id })
  }

  const openEditProfile = (profile) => {
    setProfileForm({
      fullName: profile.fullName || '',
      salaryAmount: profile.salaryAmount ?? '',
      usedCapacity: profile.usedCapacity ?? '',
      accountStatus: profile.accountStatus || 'Active',
    })
    setProfileModal({ id: profile.id })
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        username: userForm.username,
        fullName: userForm.fullName,
        phoneNumber: userForm.phoneNumber,
        role: userForm.role,
      }
      if (userForm.password) payload.password = userForm.password

      if (userModal === 'create') {
        await createUser(payload)
        toast.success('تم إنشاء المستخدم')
      } else {
        await updateUser(userModal.id, payload)
        toast.success('تم تحديث المستخدم')
      }
      setUserModal(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ المستخدم')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updateSalfaProfile(profileModal.id, {
        fullName: profileForm.fullName,
        salaryAmount: Number(profileForm.salaryAmount),
        usedCapacity: Number(profileForm.usedCapacity),
        accountStatus: profileForm.accountStatus,
      })
      toast.success('تم تحديث الملف')
      setProfileModal(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث الملف')
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
    } catch {
      toast.error('فشل حذف المستخدم')
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
    { key: 'fullName', header: 'الاسم الكامل' },
    { key: 'phoneNumber', header: 'رقم الهاتف' },
    {
      key: 'role',
      header: 'الدور',
      render: (row) => <Badge variant="info">{row.role}</Badge>,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={() => openEditUser(row)}>
            تعديل
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            حذف
          </Button>
        </div>
      ),
    },
  ]

  const profileColumns = [
    { key: 'fullName', header: 'الاسم الكامل' },
    {
      key: 'salaryAmount',
      header: 'الراتب',
      render: (row) => formatIQD(row.salaryAmount),
    },
    {
      key: 'usedCapacity',
      header: 'السعة المستخدمة',
      render: (row) => formatIQD(row.usedCapacity),
    },
    {
      key: 'accountStatus',
      header: 'حالة الحساب',
      render: (row) => accountBadge(row.accountStatus),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openEditProfile(row)}>
          تعديل
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="المستخدمون وملفات سلفة"
        subtitle="إدارة حسابات المستخدمين وملفات الادخار"
        action={
          tab === 'users' ? (
            <Button onClick={openCreateUser}>إضافة مستخدم</Button>
          ) : null
        }
      />

      <div className="flex gap-2 mb-6">
        {[
          { key: 'users', label: 'المستخدمون' },
          { key: 'profiles', label: 'ملفات سلفة' },
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
            columns={tab === 'users' ? userColumns : profileColumns}
            data={tab === 'users' ? users : profiles}
          />
        )}
      </Card>

      <Modal
        open={!!userModal}
        onClose={() => setUserModal(null)}
        title={userModal === 'create' ? 'إضافة مستخدم' : 'تعديل مستخدم'}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <Input
            label="اسم المستخدم"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            required
            disabled={userModal !== 'create'}
          />
          <Input
            label="الاسم الكامل"
            value={userForm.fullName}
            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            required
          />
          <Input
            label="رقم الهاتف"
            value={userForm.phoneNumber}
            onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
          />
          <Input
            label={userModal === 'create' ? 'كلمة المرور' : 'كلمة المرور (اتركها فارغة للإبقاء)'}
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            required={userModal === 'create'}
          />
          <Select
            label="الدور"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="Member">عضو</option>
            <option value="Admin">مدير</option>
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setUserModal(null)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!profileModal}
        onClose={() => setProfileModal(null)}
        title="تعديل ملف سلفة"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
          />
          <Input
            label="الراتب (د.ع)"
            type="number"
            value={profileForm.salaryAmount}
            onChange={(e) => setProfileForm({ ...profileForm, salaryAmount: e.target.value })}
          />
          <Input
            label="السعة المستخدمة (د.ع)"
            type="number"
            value={profileForm.usedCapacity}
            onChange={(e) => setProfileForm({ ...profileForm, usedCapacity: e.target.value })}
          />
          <Select
            label="حالة الحساب"
            value={profileForm.accountStatus}
            onChange={(e) => setProfileForm({ ...profileForm, accountStatus: e.target.value })}
          >
            <option value="Active">نشط</option>
            <option value="Restricted">مقيّد</option>
            <option value="Suspended">موقوف</option>
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setProfileModal(null)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ
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
