export const GROUP_STATUS = {
  Open: { label: 'مفتوح', variant: 'success' },
  Full: { label: 'مكتمل', variant: 'info' },
  LotteryPending: { label: 'بانتظار القرعة', variant: 'warning' },
  LotteryConfirming: { label: 'تأكيد القرعة', variant: 'warning' },
  Active: { label: 'نشط', variant: 'accent' },
  Frozen: { label: 'مجمد', variant: 'info' },
  Cancelled: { label: 'ملغي', variant: 'danger' },
}

export const DEFAULT_STATUS = {
  Open: { label: 'مفتوح', variant: 'danger' },
  InProgress: { label: 'قيد المعالجة', variant: 'warning' },
  Escalated: { label: 'مُصعَّد', variant: 'danger', pulse: true },
  Resolved: { label: 'محلول', variant: 'success' },
}

export const PAYMENT_STATUS = {
  Scheduled: { label: 'مجدول', color: 'bg-slate-600' },
  Processing: { label: 'قيد المعالجة', color: 'bg-blue-500' },
  Completed: { label: 'مكتمل', color: 'bg-emerald-500' },
  Failed: { label: 'فاشل', color: 'bg-red-500' },
  CoveredByFund: { label: 'من الصندوق', color: 'bg-purple-500' },
  Waived: { label: 'معفى', color: 'bg-slate-500' },
}

export const ACCOUNT_STATUS = {
  Active: { label: 'نشط', variant: 'success' },
  Restricted: { label: 'مقيّد', variant: 'warning' },
  Suspended: { label: 'موقوف', variant: 'danger' },
}

export const FUND_TX_TYPE = {
  AutoContribution: { label: 'مساهمة تلقائية', variant: 'info' },
  ManualDeposit: { label: 'إيداع يدوي', variant: 'success' },
  ManualWithdrawal: { label: 'سحب يدوي', variant: 'warning' },
  UsedForDefault: { label: 'استخدام للتعثر', variant: 'danger' },
}
