import { useState, useCallback, useEffect } from 'react'
import {
  getEmergencyFundBalance,
  getEmergencyFundTransactions,
  createEmergencyFundTransaction,
} from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD, formatDateTime } from '../utils/formatters'
import { getApiError } from '../utils/apiError'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { FUND_TX_TYPE } from '../constants/statuses'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'
import { IconFund } from '../components/icons'

export default function EmergencyFundPage() {
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({ amount: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchFund = useCallback(async () => {
    const [balanceRes, txRes] = await Promise.all([
      getEmergencyFundBalance(),
      getEmergencyFundTransactions(),
    ])
    return {
      balance: balanceRes.data,
      transactions: Array.isArray(txRes.data) ? txRes.data : [],
    }
  }, [])

  const { data, loading, refetch, error } = useFetch(fetchFund)

  useEffect(() => {
    if (error) toast.error('فشل تحميل بيانات صندوق الطوارئ')
  }, [error, toast])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createEmergencyFundTransaction({
        type: showForm === 'deposit' ? 'Contribution' : 'Disbursement',
        amount: Number(form.amount),
        notes: form.notes || undefined,
      })
      toast.success(showForm === 'deposit' ? 'تم الإيداع بنجاح' : 'تم السحب بنجاح')
      setShowForm(null)
      setForm({ amount: '', notes: '' })
      refetch()
    } catch (err) {
      toast.error(getApiError(err, 'فشل العملية'))
    } finally {
      setSubmitting(false)
    }
  }

  const txBadge = (type) => {
    const cfg = FUND_TX_TYPE[type] || { label: type, variant: 'default' }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const columns = [
    {
      key: 'type',
      header: 'النوع',
      render: (row) => txBadge(row.type),
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (row) => (
        <span className={row.type === 'Disbursement' ? 'text-red-400' : 'text-emerald-400'}>
          {row.type === 'Disbursement' ? '−' : '+'}
          {formatIQD(row.amount)}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'ملاحظة',
      render: (row) => row.notes || '—',
    },
    {
      key: 'occurredAt',
      header: 'التاريخ',
      render: (row) => formatDateTime(row.occurredAt),
    },
  ]

  if (loading) return <PageSkeleton />

  const balance = data?.balance

  return (
    <>
      <PageHeader
        title="صندوق الطوارئ"
        subtitle="إدارة رصيد ومعاملات صندوق الطوارئ"
        action={
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setShowForm('deposit')}>
              إيداع
            </Button>
            <Button variant="secondary" onClick={() => setShowForm('withdraw')}>
              سحب
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="الرصيد الحالي"
          value={formatIQD(balance?.currentBalance)}
          icon={IconFund}
          accent="accent"
        />
        <StatCard
          label="إجمالي المساهمات"
          value={formatIQD(balance?.totalContributions)}
          icon={IconFund}
          accent="blue"
        />
        <StatCard
          label="إجمالي الصرف"
          value={formatIQD(balance?.totalDisbursements)}
          icon={IconFund}
          accent="purple"
        />
      </div>

      <Card title="سجل المعاملات">
        <DataTable columns={columns} data={data?.transactions || []} emptyMessage="لا توجد معاملات" />
      </Card>

      <Modal
        open={!!showForm}
        onClose={() => setShowForm(null)}
        title={showForm === 'deposit' ? 'إيداع يدوي' : 'سحب يدوي'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="المبلغ (د.ع)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="100000"
            required
          />
          <Textarea
            label="ملاحظة"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="سبب العملية..."
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(null)}>
              إلغاء
            </Button>
            <Button type="submit" loading={submitting} variant={showForm === 'withdraw' ? 'danger' : 'primary'}>
              {showForm === 'deposit' ? 'إيداع' : 'سحب'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
