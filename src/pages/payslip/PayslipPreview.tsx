import { toNum, money } from './helpers'
import numberToWords from './numberToWords'

function PreviewRow({ rows, currency }) {
  return rows
    .filter((r) => (r.label || '').trim() || toNum(r.amount))
    .map((r, i) => (
      <tr key={i} className="border-b border-neutral-100 last:border-0">
        <td className="py-1.5 pr-2">{r.label || '—'}</td>
        <td className="py-1.5 text-right tabular-nums">{money(toNum(r.amount), currency)}</td>
      </tr>
    ))
}

export default function PayslipPreview({ v, gross, totalDeductions, net }) {
  const currency = v.currency
  const detail = (label, value) =>
    value ? (
      <div className="flex gap-2">
        <span className="w-28 shrink-0 text-neutral-500">{label}</span>
        <span className="font-medium text-neutral-800">{value}</span>
      </div>
    ) : null

  return (
    <div className="mx-auto w-full max-w-[800px] bg-white p-8 text-neutral-800 shadow-sm ring-1 ring-neutral-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="text-2xl font-bold tracking-tight">{v.companyName || 'Company'}</div>
          {v.companyAddress && (
            <div className="mt-1 text-xs text-neutral-500">{v.companyAddress}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tracking-wide">PAYSLIP</div>
          <div className="mt-1 text-xs text-neutral-500">Pay period: {v.payPeriod || '—'}</div>
          <div className="text-xs text-neutral-500">Pay date: {v.payDate || '—'}</div>
        </div>
      </div>

      {/* Employee details */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-1.5 py-4 text-sm sm:grid-cols-2">
        {detail('Employee Name', v.empName)}
        {detail('Employee ID', v.empId)}
        {detail('Designation', v.designation)}
        {detail('Department', v.department)}
        {detail('Date of Joining', v.joinDate)}
        {detail('Payment Method', v.paymentMethod)}
        {detail('Bank Account', v.bankAccount)}
        {detail('Tax ID', v.taxId)}
      </div>

      {/* Earnings / Deductions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-800 text-white">
              <th className="px-3 py-1.5 text-left font-medium">Earnings</th>
              <th className="px-3 py-1.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="px-3">
            <PreviewRow rows={v.earnings || []} currency={currency} />
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 font-semibold">
              <td className="px-3 py-1.5">Gross Earnings</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{money(gross, currency)}</td>
            </tr>
          </tfoot>
        </table>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-800 text-white">
              <th className="px-3 py-1.5 text-left font-medium">Deductions</th>
              <th className="px-3 py-1.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <PreviewRow rows={v.deductions || []} currency={currency} />
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 font-semibold">
              <td className="px-3 py-1.5">Total Deductions</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{money(totalDeductions, currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net pay */}
      <div className="mt-4 flex items-center justify-between bg-neutral-800 px-4 py-3 text-white">
        <span className="text-sm font-bold tracking-wide">NET PAY</span>
        <span className="text-lg font-bold tabular-nums">{money(net, currency)}</span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">Net pay in words: {numberToWords(net)}</p>

      {v.notes && <p className="mt-4 text-[11px] leading-relaxed text-neutral-400">{v.notes}</p>}
    </div>
  )
}
