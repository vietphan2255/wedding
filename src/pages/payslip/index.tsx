import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Download, ArrowLeft, RotateCcw } from 'lucide-react'
import { sum, money } from './helpers'
import { downloadPaySlip } from './buildPaySlipPdf'
import useDraftStorage, { loadDraft, clearDraft } from './useDraftStorage'
import PayslipPreview from './PayslipPreview.jsx'

const STORAGE_KEY = 'vn-payslip-draft'

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

/* ---------- page ---------- */

export default function PaySlipPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Payslip · Viet Nguyen'
    return () => {
      document.title = prev
    }
  }, [])

  const initialValues = useMemo(() => loadDraft(STORAGE_KEY, makeDefaults()), [])
  const { register, control, watch, getValues, reset } = useForm({
    defaultValues: initialValues,
  })
  const earnings = useFieldArray({ control, name: 'earnings' })
  const deductions = useFieldArray({ control, name: 'deductions' })
  const [busy, setBusy] = useState(false)

  useDraftStorage(STORAGE_KEY, watch)

  const v = watch()
  const gross = sum(v.earnings)
  const totalDeductions = sum(v.deductions)
  const net = gross - totalDeductions

  const handleDownload = async () => {
    setBusy(true)
    try {
      await downloadPaySlip(getValues())
    } catch (err) {
      console.error('Payslip PDF generation failed', err)
    } finally {
      setBusy(false)
    }
  }

  const handleReset = () => {
    clearDraft(STORAGE_KEY)
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
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
            <ArrowLeft size={16} /> Back to site
          </Link>
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
