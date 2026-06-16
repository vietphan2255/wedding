// PDF builder for the payslip. Lazy-loads jsPDF + jspdf-autotable so the
// dependency stays out of the main bundle (only this route ever uses them).
// Exports both `buildPaySlipPdf` (returns the jsPDF doc — testable without
// triggering a browser download) and `downloadPaySlip` (convenience wrapper
// that calls .save() with a derived filename).

import { toNum, sum, money } from './helpers'
import numberToWords from './numberToWords'
import type { PaySlipValues } from './types'
import type { jsPDF } from 'jspdf'

// jsPDF's built-in fonts are Latin-1 only, so Vietnamese diacritics break.
// Embed Roboto (covers Vietnamese); fetch + base64 once, then register per
// doc. Cached at module scope so reopening the page is instant.
let robotoCache: { regular: string; bold: string } | null = null

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(binary)
}

async function ensureRoboto(doc: jsPDF): Promise<void> {
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

// Lazy-loaded jsPDF + autotable. Cached promise so concurrent calls don't
// fire two dynamic imports.
type PdfDeps = {
  jsPDF: typeof import('jspdf').jsPDF
  autoTable: typeof import('jspdf-autotable').default
}
let pdfDepsPromise: Promise<PdfDeps> | null = null
function loadPdfDeps(): Promise<PdfDeps> {
  if (!pdfDepsPromise) {
    pdfDepsPromise = Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]).then(([jspdfMod, autoMod]) => ({
      jsPDF: jspdfMod.jsPDF,
      autoTable: autoMod.default,
    }))
  }
  return pdfDepsPromise
}

export async function buildPaySlipPdf(v: PaySlipValues): Promise<jsPDF> {
  const { jsPDF, autoTable } = await loadPdfDeps()

  const currency = v.currency || ''
  const earnings = (v.earnings || []).filter(
    (r) => (r.label || '').trim() || toNum(r.amount),
  )
  const deductions = (v.deductions || []).filter(
    (r) => (r.label || '').trim() || toNum(r.amount),
  )
  const gross = sum(earnings)
  const totalDeductions = sum(deductions)
  const net = gross - totalDeductions

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  await ensureRoboto(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = margin + 6

  // Header — company (left) + PAYSLIP meta (right)
  doc.setFont('Roboto', 'bold')
  doc.setFontSize(20)
  doc.text(v.companyName || 'Company', margin, y)
  if (v.companyAddress) {
    doc.setFont('Roboto', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(v.companyAddress, margin, y + 16)
  }
  doc.setTextColor(40)
  doc.setFont('Roboto', 'bold')
  doc.setFontSize(15)
  doc.text('PAYSLIP', pageW - margin, y - 4, { align: 'right' })
  doc.setFont('Roboto', 'normal')
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
  // jspdf-autotable patches the doc with lastAutoTable; cast for TS.
  const lastAutoTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
  y = lastAutoTable.finalY + 14

  // Earnings & Deductions — full-width stacked tables with a roomy
  // right-aligned amount column so large amounts never overflow or wrap.
  const headStyles = { fillColor: [38, 38, 38] as [number, number, number], textColor: 255, halign: 'left' as const }
  const footStyles = { fillColor: [240, 240, 240] as [number, number, number], textColor: 20, fontStyle: 'bold' as const }
  const tableBase = {
    theme: 'grid' as const,
    styles: { font: 'Roboto', fontSize: 9, overflow: 'linebreak' as const },
    headStyles,
    footStyles,
    columnStyles: { 1: { halign: 'right' as const, cellWidth: 150 } },
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
    startY: lastAutoTable.finalY + 12,
    head: [['Deductions', 'Amount']],
    body: deductions.map((r) => [r.label || '-', money(toNum(r.amount), currency)]),
    foot: [['Total Deductions', money(totalDeductions, currency)]],
  })

  y = lastAutoTable.finalY + 18

  // Net pay bar
  doc.setFillColor(38, 38, 38)
  doc.rect(margin, y, pageW - 2 * margin, 30, 'F')
  doc.setTextColor(255)
  doc.setFont('Roboto', 'bold')
  doc.setFontSize(11)
  doc.text('NET PAY', margin + 12, y + 19)
  doc.text(money(net, currency), pageW - margin - 12, y + 19, { align: 'right' })
  doc.setTextColor(0)
  y += 30 + 16

  doc.setFont('Roboto', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60)
  doc.text(`Net pay in words: ${numberToWords(net)}`, margin, y)
  y += 22

  if (v.notes) {
    doc.setFontSize(8)
    doc.setTextColor(130)
    doc.text(doc.splitTextToSize(v.notes, pageW - 2 * margin), margin, y)
  }

  return doc
}

export function paySlipFilename(v: PaySlipValues): string {
  const safeName = (v.empName || 'employee').trim().replace(/\s+/g, '-')
  const safePeriod = (v.payPeriod || '').trim().replace(/\s+/g, '-')
  return `payslip-${safeName}${safePeriod ? `-${safePeriod}` : ''}.pdf`
}

export async function downloadPaySlip(v: PaySlipValues): Promise<void> {
  const doc = await buildPaySlipPdf(v)
  doc.save(paySlipFilename(v))
}
