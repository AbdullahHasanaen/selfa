import { useState, useCallback, useEffect } from 'react'
import {
  getEmergencyFund,
  getEmergencyFundTransactions,
  depositEmergencyFund,
  withdrawEmergencyFund,
} from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD, formatDateTime } from '../utils/formatters'
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
  const [form, setForm] = useState({ amount: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchFund = useCallback(async () => {
    const [fundRes, txRes] = await Promise.all([
      getEmergencyFund(),
      getEmergencyFundTransactions(),
    ])
    const balance = fundRes.data.balance ?? fundRes.data.currentBalance ?? fundRes.data
    const transactions = Array.isArray(txRes.data) ? txRes.data : txRes.data.items || []
    return { balance, transactions }
  }, [])

  const { data, loading, refetch, error } = useFetch(fetchFund)

  useEffect(() => {
    if (error) toast.error('فشل تحميل بيانات صندوق الطوارئ')
  }, [error, toast])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const amount = Number(form.amount)
      if (showForm === 'deposit') {
        await depositEmergencyFund(amount, form.note)
        toast.success('تم الإيداع بنجاح')
      } else {
        await withdrawEmergencyFund(amount, form.note)
        toast.success('تم السحب بنجاح')
      }
      setShowForm(null)
      setForm({ amount: '', note: '' })
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل العملية')
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
        <span className={row.type === 'ManualWithdrawal' || row.type === 'UsedForDefault' ? 'text-red-400' : 'text-emerald-400'}>
          {row.type === 'ManualWithdrawal' || row.type === 'UsedForDefault' ? '−' : '+'}
          {formatIQD(row.amount)}
        </span>
      ),
    },
    {
      key: 'note',
      header: 'ملاحظة',
      render: (row) => row.note || '—',
    },
    {
      key: 'createdAt',
      header: 'التاريخ',
      render: (row) => formatDateTime(row.createdAt || row.date),
    },
  ]

  if (loading) return <PageSkeleton />

  const balanceValue = typeof data?.balance === 'object' ? data.balance.balance : data?.balance

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

      <div className="mb-6">
        <StatCard
          label="الرصيد الحالي"
          value={formatIQD(balanceValue)}
          icon={IconFund}
          accent="accent"
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
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
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
