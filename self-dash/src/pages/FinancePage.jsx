import { useCallback, useEffect } from 'react'
import { getRevenueLog, getFinanceSummary } from '../api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { formatIQD, formatDate } from '../utils/formatters'
import Card, { StatCard } from '../components/ui/Card'
import DataTable, { PageHeader } from '../components/ui/DataTable'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'
import { IconRevenue, IconGroups2, IconMembers, IconFund, IconAlert } from '../components/icons'

export default function FinancePage() {
  const { toast } = useToast()

  const fetchFinance = useCallback(async () => {
    const [revenueRes, summaryRes] = await Promise.all([
      getRevenueLog(),
      getFinanceSummary(),
    ])
    return {
      revenue: Array.isArray(revenueRes.data) ? revenueRes.data : [],
      summary: summaryRes.data,
    }
  }, [])

  const { data, loading, error } = useFetch(fetchFinance)

  useEffect(() => {
    if (error) toast.error('فشل تحميل البيانات المالية')
  }, [error, toast])

  const columns = [
    {
      key: 'recordedAt',
      header: 'تاريخ التسجيل',
      render: (row) => formatDate(row.recordedAt),
    },
    {
      key: 'periodMonth',
      header: 'الشهر',
      render: (row) => formatDate(row.periodMonth),
    },
    {
      key: 'paymentScheduleId',
      header: 'معرّف الدفعة',
      render: (row) => (
        <span className="font-mono text-xs">{row.paymentScheduleId?.slice(0, 8) ?? '—'}…</span>
      ),
    },
    {
      key: 'amount',
      header: 'العمولة (1%)',
      render: (row) => formatIQD(row.amount),
    },
  ]

  if (loading) return <PageSkeleton />

  const summary = data?.summary
  const revenue = data?.revenue || []

  const stats = [
    {
      label: 'إجمالي الإيرادات',
      value: formatIQD(summary?.totalRevenueAllTime),
      icon: IconRevenue,
      accent: 'accent',
    },
    {
      label: 'إيرادات هذا الشهر',
      value: formatIQD(summary?.revenueThisMonth),
      icon: IconRevenue,
      accent: 'blue',
    },
    {
      label: 'المجموعات النشطة',
      value: summary?.activeGroupsCount?.toLocaleString('ar-IQ') ?? '—',
      icon: IconGroups2,
      accent: 'purple',
    },
    {
      label: 'إجمالي الأعضاء النشطين',
      value: summary?.totalMembersActive?.toLocaleString('ar-IQ') ?? '—',
      icon: IconMembers,
      accent: 'blue',
    },
    {
      label: 'رصيد صندوق الطوارئ',
      value: formatIQD(summary?.emergencyFundBalance),
      icon: IconFund,
      accent: 'accent',
    },
    {
      label: 'حالات التعثر المفتوحة',
      value: summary?.openDefaultCasesCount?.toLocaleString('ar-IQ') ?? '—',
      icon: IconAlert,
      accent: 'red',
    },
  ]

  return (
    <>
      <PageHeader
        title="المالية والإيرادات"
        subtitle="نظرة عامة على الأداء المالي والإيرادات"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card title="سجل الإيرادات">
        <DataTable columns={columns} data={revenue} emptyMessage="لا توجد إيرادات مسجلة" />
      </Card>
    </>
  )
}
