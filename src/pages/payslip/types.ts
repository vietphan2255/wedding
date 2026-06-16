export interface PaySlipRow {
  label: string
  amount: number | string
}

export interface PaySlipValues {
  companyName: string
  companyAddress: string
  payPeriod: string
  payDate: string
  currency: string
  empName: string
  empId: string
  designation: string
  department: string
  joinDate: string
  bankAccount: string
  taxId: string
  paymentMethod: string
  earnings: PaySlipRow[]
  deductions: PaySlipRow[]
  notes: string
}
