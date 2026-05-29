import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Download, ArrowLeft, RotateCcw } from 'lucide-react'

/* ---------- helpers ---------- */

const toNum = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

const sum = (rows) => (rows || []).reduce((s, r) => s + toNum(r.amount), 0)

const money = (n, currency) =>
  `${currency || ''}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`

// Net pay → words (handles up to trillions, plus cents as "and NN/100").
function numberToWords(value) {
  if (!Number.isFinite(value)) return ''
  const negative = value < 0
  const abs = Math.abs(value)
  const whole = Math.floor(abs)
  const cents = Math.round((abs - whole) * 100)

  const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion']

  const threeDigits = (num) => {
    let out = ''
    const h = Math.floor(num / 100)
    const rem = num % 100
    if (h) out += `${ones[h]} Hundred${rem ? ' ' : ''}`
    if (rem) {
      if (rem < 20) out += ones[rem]
      else out += tens[Math.floor(rem / 10)] + (rem % 10 ? `-${ones[rem % 10]}` : '')
    }
    return out
  }

  let words = ''
  if (whole === 0) words = 'Zero'
  else {
    const groups = []
    let n = whole
    while (n > 0) {
      groups.push(n % 1000)
      n = Math.floor(n / 1000)
    }
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i]) words += `${threeDigits(groups[i])}${scales[i] ? ` ${scales[i]}` : ''} `
    }
    words = words.trim()
  }

  let result = `${negative ? 'Minus ' : ''}${words}`
  if (cents) result += ` and ${String(cents).padStart(2, '0')}/100`
  return result
}

function makeDefaults() {
  const now = new Date()
  const period = `${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`
  return {
    companyName: 'Viet Nguyen',
    companyAddress: '',
    payPeriod: period,
    payDate: now.toISOString().slice(0, 10),
    currency: '$',
    empName: '',
    empId: '',
    designation: '',
    department: '',
    joinDate: '',
    bankAccount: '',
    taxId: '',
    paymentMethod: 'Bank transfer',
    earnings: [
      { label: 'Basic Salary', amount: 0 },
      { label: 'House Rent Allowance', amount: 0 },
      { label: 'Conveyance Allowance', amount: 0 },
      { label: 'Medical Allowance', amount: 0 },
      { label: 'Special Allowance', amount: 0 },
    ],
    deductions: [
      { label: 'Income Tax', amount: 0 },
      { label: 'Provident Fund', amount: 0 },
      { label: 'Professional Tax', amount: 0 },
      { label: 'Insurance', amount: 0 },
    ],
    notes: 'This is a computer-generated payslip and does not require a signature.',
  }
}

// Draft persistence — the form is saved to localStorage on every change and
// restored on reload so work isn't lost.
const STORAGE_KEY = 'vn-payslip-draft'

function loadInitial() {
  const base = makeDefaults()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return base
    return {
      ...base,
      ...saved,
      earnings: Array.isArray(saved.earnings) ? saved.earnings : base.earnings,
      deductions: Array.isArray(saved.deductions) ? saved.deductions : base.deductions,
    }
  } catch {
    return base
  }
}

/* ---------- fonts (Vietnamese support) ---------- */

// jsPDF's built-in fonts are Latin-1 only, so Vietnamese diacritics break.
// Embed Roboto (covers Vietnamese); fetch + base64 once, register per doc.
let robotoCache = null
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}
async function ensureRoboto(doc) {
  if (!robotoCache) {
    const [reg, bold] = await Promise.all([
      fetch('/fonts/Roboto-Regular.ttf').then((r) => r.arrayBuffer()),
      fetch('/fonts/Roboto-Bold.ttf').then((r) => r.arrayBuffer()),
    ])
    robotoCache = {
      regular: arrayBufferToBase64(reg),
      bold: arrayBufferToBase64(bold),
    }
  }
  doc.addFileToVFS('Roboto-Regular.ttf', robotoCache.regular)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFileToVFS('Roboto-Bold.ttf', robotoCache.bold)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
  doc.setFont('Roboto', 'normal')
}

/* ---------- PDF builder ---------- */

async function generatePdf(v) {
  // Lazy-load jsPDF on click so it stays out of the main bundle (only this
  // route ever needs it).
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const currency = v.currency || ''
  const earnings = (v.earnings || []).filter((r) => (r.label || '').trim() || toNum(r.amount))
  const deductions = (v.deductions || []).filter((r) => (r.label || '').trim() || toNum(r.amount))
  const gross = sum(earnings)
  const totalDeductions = sum(deductions)
  const net = gross - totalDeductions

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  await ensureRoboto(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = margin + 6

  // Header — company (left) + PAYSLIP meta (right)
  doc.setFont('Roboto','bold')
  doc.setFontSize(20)
  doc.text(v.companyName || 'Company', margin, y)
  if (v.companyAddress) {
    doc.setFont('Roboto','normal')
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(v.companyAddress, margin, y + 16)
  }
  doc.setTextColor(40)
  doc.setFont('Roboto','bold')
  doc.setFontSize(15)
  doc.text('PAYSLIP', pageW - margin, y - 4, { align: 'right' })
  doc.setFont('Roboto','normal')
  doc.setFontSize(9)
  doc.setTextColor(90)
  doc.text(`Pay period: ${v.payPeriod || '-'}`, pageW - margin, y + 12, { align: 'right' })
  doc.text(`Pay date: ${v.payDate || '-'}`, pageW - margin, y + 26, { align: 'right' })
  doc.setTextColor(0)

  y += 40
  doc.setDrawColor(210)
  doc.line(margin, y, pageW - margin, y)
  y += 14

  // Employee details — borderless label/value grid
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { font: 'Roboto', fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: 90, cellWidth: 95 },
      1: { cellWidth: (pageW - 2 * margin) / 2 - 95 },
      2: { fontStyle: 'bold', textColor: 90, cellWidth: 95 },
      3: { cellWidth: 'auto' },
    },
    body: [
      ['Employee Name', v.empName || '-', 'Employee ID', v.empId || '-'],
      ['Designation', v.designation || '-', 'Department', v.department || '-'],
      ['Date of Joining', v.joinDate || '-', 'Payment Method', v.paymentMethod || '-'],
      ['Bank Account', v.bankAccount || '-', 'Tax ID', v.taxId || '-'],
    ],
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 14

  // Earnings & Deductions — full-width stacked tables with a roomy right-aligned
  // amount column so large amounts (e.g. VND) never overflow / wrap.
  const headStyles = { fillColor: [38, 38, 38], textColor: 255, halign: 'left' }
  const footStyles = { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' }
  const tableBase = {
    theme: 'grid',
    styles: { font: 'Roboto', fontSize: 9, overflow: 'linebreak' },
    headStyles,
    footStyles,
    columnStyles: { 1: { halign: 'right', cellWidth: 150 } },
    margin: { left: margin, right: margin },
  }

  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Earnings', 'Amount']],
    body: earnings.map((r) => [r.label || '-', money(toNum(r.amount), currency)]),
    foot: [['Gross Earnings', money(gross, currency)]],
  })

  autoTable(doc, {
    ...tableBase,
    startY: doc.lastAutoTable.finalY + 12,
    head: [['Deductions', 'Amount']],
    body: deductions.map((r) => [r.label || '-', money(toNum(r.amount), currency)]),
    foot: [['Total Deductions', money(totalDeductions, currency)]],
  })

  y = doc.lastAutoTable.finalY + 18

  // Net pay bar
  doc.setFillColor(38, 38, 38)
  doc.rect(margin, y, pageW - 2 * margin, 30, 'F')
  doc.setTextColor(255)
  doc.setFont('Roboto','bold')
  doc.setFontSize(11)
  doc.text('NET PAY', margin + 12, y + 19)
  doc.text(money(net, currency), pageW - margin - 12, y + 19, { align: 'right' })
  doc.setTextColor(0)
  y += 30 + 16

  doc.setFont('Roboto','normal')
  doc.setFontSize(9)
  doc.setTextColor(60)
  doc.text(`Net pay in words: ${numberToWords(net)}`, margin, y)
  y += 22

  if (v.notes) {
    doc.setFontSize(8)
    doc.setTextColor(130)
    doc.text(doc.splitTextToSize(v.notes, pageW - 2 * margin), margin, y)
  }

  const safeName = (v.empName || 'employee').trim().replace(/\s+/g, '-')
  const safePeriod = (v.payPeriod || '').trim().replace(/\s+/g, '-')
  doc.save(`payslip-${safeName}${safePeriod ? `-${safePeriod}` : ''}.pdf`)
}

/* ---------- form field primitives ---------- */

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400'
const labelCls = 'block text-xs font-medium text-neutral-500 mb-1'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  )
}

function LineItems({ title, fieldArray, register, name, currency, total }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
        <button
          type="button"
          onClick={() => fieldArray.append({ label: '', amount: 0 })}
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
        >
          <Plus size={14} /> Add row
        </button>
      </div>
      <div className="space-y-2">
        {fieldArray.fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`${name}.${i}.label`)}
              placeholder="Description"
              className={`${inputCls} flex-1`}
            />
            <input
              {...register(`${name}.${i}.amount`)}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`${inputCls} w-28 text-right`}
            />
            <button
              type="button"
              onClick={() => fieldArray.remove(i)}
              aria-label="Remove row"
              className="shrink-0 rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-800">
        <span>{title === 'Earnings' ? 'Gross Earnings' : 'Total Deductions'}</span>
        <span>{money(total, currency)}</span>
      </div>
    </div>
  )
}

/* ---------- live preview ---------- */

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

function PayslipPreview({ v, gross, totalDeductions, net }) {
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

/* ---------- page ---------- */

export default function PaySlipPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Payslip · Viet Nguyen'
    return () => {
      document.title = prev
    }
  }, [])

  const initialValues = useMemo(loadInitial, [])
  const { register, control, watch, getValues, reset } = useForm({
    defaultValues: initialValues,
  })
  const earnings = useFieldArray({ control, name: 'earnings' })
  const deductions = useFieldArray({ control, name: 'deductions' })
  const [busy, setBusy] = useState(false)

  // Persist the form to localStorage on every change; restored on reload.
  useEffect(() => {
    const sub = watch((value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* ignore storage errors (quota / private mode) */
      }
    })
    return () => sub.unsubscribe()
  }, [watch])

  const v = watch()
  const gross = sum(v.earnings)
  const totalDeductions = sum(v.deductions)
  const net = gross - totalDeductions

  const handleDownload = async () => {
    setBusy(true)
    try {
      await generatePdf(getValues())
    } catch (err) {
      console.error('Payslip PDF generation failed', err)
    } finally {
      setBusy(false)
    }
  }

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    reset(makeDefaults())
  }

  return (
    <div
      className="min-h-screen bg-neutral-100 text-neutral-800"
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
            <ArrowLeft size={16} /> Back to site
          </a>
          <h1 className="text-sm font-semibold text-neutral-700">Monthly Payslip Generator</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Clear saved draft and reset the form"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} /> {busy ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        {/* Form */}
        <form className="space-y-7" onSubmit={(e) => e.preventDefault()}>
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Company &amp; pay period</h2>
            <Field label="Company name">
              <input {...register('companyName')} className={inputCls} />
            </Field>
            <Field label="Company address (optional)">
              <input {...register('companyAddress')} className={inputCls} placeholder="123 Street, City" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pay period">
                <input {...register('payPeriod')} className={inputCls} placeholder="May 2026" />
              </Field>
              <Field label="Pay date">
                <input {...register('payDate')} type="date" className={inputCls} />
              </Field>
              <Field label="Currency">
                <input {...register('currency')} className={inputCls} placeholder="$" />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Employee</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employee name">
                <input {...register('empName')} className={inputCls} placeholder="Jane Doe" />
              </Field>
              <Field label="Employee ID">
                <input {...register('empId')} className={inputCls} placeholder="EMP-001" />
              </Field>
              <Field label="Designation">
                <input {...register('designation')} className={inputCls} placeholder="Software Engineer" />
              </Field>
              <Field label="Department">
                <input {...register('department')} className={inputCls} placeholder="Engineering" />
              </Field>
              <Field label="Date of joining (optional)">
                <input {...register('joinDate')} type="date" className={inputCls} />
              </Field>
              <Field label="Payment method (optional)">
                <input {...register('paymentMethod')} className={inputCls} />
              </Field>
              <Field label="Bank account (optional)">
                <input {...register('bankAccount')} className={inputCls} placeholder="****1234" />
              </Field>
              <Field label="Tax ID (optional)">
                <input {...register('taxId')} className={inputCls} />
              </Field>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <LineItems
              title="Earnings"
              fieldArray={earnings}
              register={register}
              name="earnings"
              currency={v.currency}
              total={gross}
            />
            <LineItems
              title="Deductions"
              fieldArray={deductions}
              register={register}
              name="deductions"
              currency={v.currency}
              total={totalDeductions}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Footer note</h2>
            <Field label="Notes">
              <textarea {...register('notes')} rows={2} className={inputCls} />
            </Field>
          </section>
        </form>

        {/* Live preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PayslipPreview v={v} gross={gross} totalDeductions={totalDeductions} net={net} />
        </div>
      </div>
    </div>
  )
}
