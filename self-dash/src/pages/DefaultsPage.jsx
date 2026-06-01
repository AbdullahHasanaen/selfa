import { useState, useCallback, useEffect } from 'react'
import { getDefaults, resolveDefault, escalateDefault, addDefaultAction } from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD, formatDateTime } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { DEFAULT_STATUS } from '../constants/statuses'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'
import { Select, Textarea } from '../components/ui/Input'

const RESOLUTIONS = [
  { value: 'EmergencyFund', label: 'صندوق الطوارئ' },
  { value: 'ManualCollection', label: 'تحصيل يدوي' },
  { value: 'Waived', label: 'إعفاء' },
]

export default function DefaultsPage() {
  const [resolveModal, setResolveModal] = useState(null)
  const [noteModal, setNoteModal] = useState(null)
  const [resolution, setResolution] = useState('EmergencyFund')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchDefaults = useCallback(async () => {
    const { data } = await getDefaults()
    return Array.isArray(data) ? data : data.items || []
  }, [])

  const { data: defaults = [], loading, refetch, error } = useFetch(fetchDefaults)

  useEffect(() => {
    if (error) toast.error('فشل تحميل حالات التعثر')
  }, [error, toast])

  const handleResolve = async () => {
    setSubmitting(true)
    try {
      await resolveDefault(resolveModal.id, resolution)
      toast.success('تم حل حالة التعثر')
      setResolveModal(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حل حالة التعثر')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEscalate = async (item) => {
    try {
      await escalateDefault(item.id)
      toast.success('تم تصعيد حالة التعثر')
      refetch()
    } catch {
      toast.error('فشل تصعيد حالة التعثر')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDefaultAction(noteModal.id, { note, actionType: 'Note' })
      toast.success('تم إضافة الملاحظة')
      setNoteModal(null)
      setNote('')
      refetch()
    } catch {
      toast.error('فشل إضافة الملاحظة')
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadge = (status) => {
    const cfg = DEFAULT_STATUS[status] || { label: status, variant: 'default' }
    return (
      <Badge variant={cfg.variant} pulse={cfg.pulse}>
        {cfg.label}
      </Badge>
    )
  }

  const columns = [
    {
      key: 'memberName',
      header: 'اسم العضو',
      render: (row) => row.memberName || row.member?.fullName || '—',
    },
    {
      key: 'groupName',
      header: 'المجموعة',
      render: (row) => row.groupName || (row.groupId ? `#${row.groupId}` : '—'),
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (row) => formatIQD(row.amount),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'attempts',
      header: 'المحاولات',
      render: (row) => row.attempts ?? 0,
    },
    {
      key: 'actions',
      header: 'إجراءات',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== 'Resolved' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setResolution('EmergencyFund')
                  setResolveModal(row)
                }}
              >
                حل
              </Button>
              {row.status !== 'Escalated' && (
                <Button variant="danger" size="sm" onClick={() => handleEscalate(row)}>
                  تصعيد
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setNoteModal(row)}>
            ملاحظة
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="حالات التعثر"
        subtitle="إدارة ومتابعة حالات التعثر عن السداد"
      />

      <Card>
        {loading ? <TableSkeleton cols={6} /> : <DataTable columns={columns} data={defaults} />}
      </Card>

      <Modal
        open={!!resolveModal}
        onClose={() => setResolveModal(null)}
        title="حل حالة التعثر"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            العضو: <span className="text-slate-200">{resolveModal?.memberName}</span>
            {' — '}
            المبلغ: <span className="text-slate-200">{formatIQD(resolveModal?.amount)}</span>
          </p>
          <Select
            label="طريقة الحل"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          >
            {RESOLUTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setResolveModal(null)}>
              إلغاء
            </Button>
            <Button onClick={handleResolve} loading={submitting}>
              تأكيد الحل
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!noteModal}
        onClose={() => setNoteModal(null)}
        title="إضافة ملاحظة / إجراء"
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          {noteModal?.actions?.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <p className="text-xs text-slate-500">السجل السابق</p>
              {noteModal.actions.map((a, i) => (
                <div key={i} className="p-2 bg-surface-900 rounded-lg text-xs">
                  <p className="text-slate-300">{a.note || a.description}</p>
                  <p className="text-slate-500 mt-1">{formatDateTime(a.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
          <Textarea
            label="الملاحظة"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="اكتب ملاحظتك هنا..."
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setNoteModal(null)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إضافة
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
