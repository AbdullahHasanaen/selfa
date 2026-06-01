import { useState, useCallback } from 'react'
import {
  getGroups,
  getGroupTemplates,
  createGroup,
  freezeGroup,
  unfreezeGroup,
  cancelGroup,
  runLottery,
  getLotteryVerification,
  getPaymentsMatrix,
} from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD, formatDateTime, formatDate } from '../utils/formatters'
import { getApiError } from '../utils/apiError'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { GROUP_STATUS, PAYMENT_STATUS } from '../constants/statuses'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import { Select } from '../components/ui/Input'

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [lotteryData, setLotteryData] = useState(null)
  const [paymentsData, setPaymentsData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { toast } = useToast()

  const fetchGroupsData = useCallback(async () => {
    const [groupsRes, templatesRes] = await Promise.all([getGroups(), getGroupTemplates()])
    return {
      groups: Array.isArray(groupsRes.data) ? groupsRes.data : [],
      templates: Array.isArray(templatesRes.data) ? templatesRes.data : [],
    }
  }, [])

  const { data, loading, refetch } = useFetch(fetchGroupsData)
  const groups = data?.groups || []
  const templates = data?.templates || []

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedTemplate) return
    setSubmitting(true)
    try {
      await createGroup({ groupTemplateId: Number(selectedTemplate) })
      toast.success('تم إنشاء المجموعة بنجاح')
      setShowCreate(false)
      setSelectedTemplate('')
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل إنشاء المجموعة'))
    } finally {
      setSubmitting(false)
    }
  }

  const executeAction = async () => {
    if (!confirmAction) return
    const { type, group } = confirmAction
    setSubmitting(true)
    try {
      const actions = {
        freeze: () => freezeGroup(group.id),
        unfreeze: () => unfreezeGroup(group.id),
        cancel: () => cancelGroup(group.id),
        lottery: () => runLottery(group.id),
      }
      await actions[type]()
      toast.success('تم تنفيذ الإجراء بنجاح')
      setConfirmAction(null)
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل تنفيذ الإجراء'))
    } finally {
      setSubmitting(false)
    }
  }

  const viewLottery = async (group) => {
    setModalLoading(true)
    setLotteryData({ group })
    try {
      const { data: lottery } = await getLotteryVerification(group.id)
      setLotteryData({ group, ...lottery })
    } catch (err) {
      toast.error(getApiError(err, 'فشل تحميل بيانات القرعة'))
      setLotteryData(null)
    } finally {
      setModalLoading(false)
    }
  }

  const viewPayments = async (group) => {
    setModalLoading(true)
    setPaymentsData({ group })
    try {
      const { data: payments } = await getPaymentsMatrix(group.id)
      setPaymentsData({ group, ...payments })
    } catch (err) {
      toast.error(getApiError(err, 'فشل تحميل مصفوفة الدفعات'))
      setPaymentsData(null)
    } finally {
      setModalLoading(false)
    }
  }

  const statusBadge = (status) => {
    const cfg = GROUP_STATUS[status] || { label: status, variant: 'default' }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const columns = [
    {
      key: 'groupNumber',
      header: 'رقم المجموعة',
      render: (row) => `#${row.groupNumber ?? '—'}`,
    },
    {
      key: 'template',
      header: 'القالب',
      render: (row) =>
        row.template ? `${formatIQD(row.template.totalAmount)} / ${row.template.durationMonths} شهر` : '—',
    },
    {
      key: 'members',
      header: 'الأعضاء',
      render: (row) => `${row.currentMemberCount ?? 0}/${row.memberCapacity ?? '—'}`,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'createdAt',
      header: 'تاريخ الإنشاء',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status === 'Active' && (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction({ type: 'freeze', group: row })}>
              تجميد
            </Button>
          )}
          {row.status === 'Frozen' && (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction({ type: 'unfreeze', group: row })}>
              إلغاء التجميد
            </Button>
          )}
          {!['Cancelled', 'Active'].includes(row.status) && (
            <Button variant="danger" size="sm" onClick={() => setConfirmAction({ type: 'cancel', group: row })}>
              إلغاء
            </Button>
          )}
          {['Full', 'LotteryPending'].includes(row.status) && (
            <Button variant="primary" size="sm" onClick={() => setConfirmAction({ type: 'lottery', group: row })}>
              تشغيل القرعة
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => viewLottery(row)}>
            القرعة
          </Button>
          <Button variant="ghost" size="sm" onClick={() => viewPayments(row)}>
            الدفعات
          </Button>
        </div>
      ),
    },
  ]

  const confirmMessages = {
    freeze: 'هل أنت متأكد من تجميد هذه المجموعة؟',
    unfreeze: 'هل أنت متأكد من إلغاء تجميد هذه المجموعة؟',
    cancel: 'هل أنت متأكد من إلغاء هذه المجموعة؟ لا يمكن التراجع عن هذا الإجراء.',
    lottery: 'هل أنت متأكد من تشغيل القرعة لهذه المجموعة؟',
  }

  return (
    <>
      <PageHeader
        title="المجموعات"
        subtitle="إدارة مجموعات الادخار الدوار"
        action={<Button onClick={() => setShowCreate(true)}>إنشاء مجموعة</Button>}
      />

      <Card>
        {loading ? <TableSkeleton cols={6} /> : <DataTable columns={columns} data={groups} />}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إنشاء مجموعة جديدة">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="اختر القالب"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            required
          >
            <option value="">— اختر قالب —</option>
            {templates
              .filter((t) => t.isActive)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {formatIQD(t.totalAmount)} — {t.durationMonths} أشهر — {t.memberCapacity} أعضاء
                </option>
              ))}
          </Select>
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

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeAction}
        title="تأكيد الإجراء"
        message={confirmAction ? confirmMessages[confirmAction.type] : ''}
        confirmLabel="تأكيد"
        danger={confirmAction?.type === 'cancel'}
        loading={submitting}
      />

      <Modal
        open={!!lotteryData}
        onClose={() => setLotteryData(null)}
        title={`التحقق من القرعة — مجموعة #${lotteryData?.groupNumber ?? lotteryData?.group?.groupNumber ?? '—'}`}
        size="md"
      >
        {modalLoading ? (
          <TableSkeleton rows={3} cols={1} />
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Lottery Hash</p>
              <code className="block p-3 bg-surface-900 rounded-lg text-xs text-accent-400 break-all font-mono">
                {lotteryData?.lotteryHash || '—'}
              </code>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Random Seed</p>
              <code className="block p-3 bg-surface-900 rounded-lg text-xs text-slate-300 break-all font-mono">
                {lotteryData?.randomSeed || '—'}
              </code>
            </div>
            {lotteryData?.ranAt && (
              <div>
                <p className="text-xs text-slate-500 mb-1">تاريخ القرعة</p>
                <p className="text-slate-200">{formatDateTime(lotteryData.ranAt)}</p>
              </div>
            )}
            {lotteryData?.confirmationDeadline && (
              <div>
                <p className="text-xs text-slate-500 mb-1">موعد انتهاء التأكيد</p>
                <p className="text-slate-200">{formatDateTime(lotteryData.confirmationDeadline)}</p>
              </div>
            )}
            {lotteryData?.positions?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">الترتيب</p>
                <div className="space-y-1">
                  {lotteryData.positions.map((p) => (
                    <div key={p.position} className="flex justify-between text-sm text-slate-300 p-2 bg-surface-900 rounded">
                      <span>المركز {p.position}</span>
                      <span className="font-mono text-xs text-slate-500">{p.membershipId?.slice(0, 8)}…</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!paymentsData}
        onClose={() => setPaymentsData(null)}
        title={`مصفوفة الدفعات — مجموعة #${paymentsData?.group?.groupNumber ?? '—'}`}
        size="full"
      >
        {modalLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <PaymentsMatrix data={paymentsData} />
        )}
      </Modal>
    </>
  )
}

function PaymentsMatrix({ data }) {
  const members = data?.members || []

  if (!members.length) {
    return <p className="text-center text-slate-500 py-8">لا توجد بيانات دفعات</p>
  }

  const monthLabels = members[0]?.payments?.map((p) => formatDate(p.dueMonth)) || []

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-surface-700">
            <th className="px-3 py-2 text-right text-slate-400 sticky right-0 bg-surface-800">العضو</th>
            <th className="px-2 py-2 text-center text-slate-400">المركز</th>
            {monthLabels.map((m, i) => (
              <th key={i} className="px-2 py-2 text-center text-slate-400 whitespace-nowrap">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.membershipId} className="border-b border-surface-700/50">
              <td className="px-3 py-2 text-slate-300 sticky right-0 bg-surface-800 whitespace-nowrap">
                {member.memberName}
              </td>
              <td className="px-2 py-2 text-center text-slate-400">{member.lotteryPosition}</td>
              {(member.payments || []).map((payment, ci) => {
                const cfg = PAYMENT_STATUS[payment.status] || { label: payment.status, color: 'bg-slate-600' }
                return (
                  <td key={ci} className="px-1 py-2 text-center">
                    <span
                      className={`inline-block w-6 h-6 rounded ${cfg.color} cursor-default`}
                      title={cfg.label}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-surface-700">
        {Object.entries(PAYMENT_STATUS).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`w-3 h-3 rounded ${cfg.color}`} />
            {cfg.label}
          </div>
        ))}
      </div>
    </div>
  )
}
