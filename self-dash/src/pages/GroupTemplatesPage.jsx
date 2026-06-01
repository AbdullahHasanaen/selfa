import { useState, useCallback } from 'react'
import { getGroupTemplates, createGroupTemplate, toggleGroupTemplate } from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD } from '../utils/formatters'
import { getApiError } from '../utils/apiError'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'

export default function GroupTemplatesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ totalAmount: '', durationMonths: '' })
  const { toast } = useToast()

  const fetchTemplates = useCallback(async () => {
    const { data } = await getGroupTemplates()
    return Array.isArray(data) ? data : []
  }, [])

  const { data: templates = [], loading, refetch } = useFetch(fetchTemplates)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createGroupTemplate({
        totalAmount: Number(form.totalAmount),
        durationMonths: Number(form.durationMonths),
      })
      toast.success('تم إنشاء القالب بنجاح')
      setShowCreate(false)
      setForm({ totalAmount: '', durationMonths: '' })
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل إنشاء القالب'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleGroupTemplate(id)
      toast.success('تم تحديث حالة القالب')
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل تحديث حالة القالب'))
    }
  }

  const columns = [
    {
      key: 'totalAmount',
      header: 'المبلغ الإجمالي',
      render: (row) => formatIQD(row.totalAmount),
    },
    {
      key: 'durationMonths',
      header: 'المدة (أشهر)',
      render: (row) => `${row.durationMonths} شهر`,
    },
    {
      key: 'monthlyInstallment',
      header: 'القسط الشهري',
      render: (row) => formatIQD(row.monthlyInstallment),
    },
    {
      key: 'memberCapacity',
      header: 'عدد الأعضاء',
      render: (row) => row.memberCapacity,
    },
    {
      key: 'isActive',
      header: 'الحالة',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => handleToggle(row.id)}>
          {row.isActive ? 'تعطيل' : 'تفعيل'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="قوالب المجموعات"
        subtitle="إدارة قوالب مجموعات الادخار الدوار"
        action={
          <Button onClick={() => setShowCreate(true)}>إنشاء قالب جديد</Button>
        }
      />

      <Card>
        {loading ? <TableSkeleton cols={6} /> : <DataTable columns={columns} data={templates} />}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إنشاء قالب جديد">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="المبلغ الإجمالي (د.ع)"
            type="number"
            value={form.totalAmount}
            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
            placeholder="500000"
            required
          />
          <Input
            label="المدة بالأشهر"
            type="number"
            value={form.durationMonths}
            onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
            placeholder="10"
            required
          />
          <p className="text-xs text-slate-500">
            عدد الأعضاء والقسط الشهري يُحسبان تلقائياً من السيرver
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إنشاء
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
