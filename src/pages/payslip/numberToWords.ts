// Net pay → English words. Handles up to quintillions and trailing cents as
// "and NN/100". Pure — easy to unit test.

const ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion']

function threeDigits(num: number): string {
  let out = ''
  const h = Math.floor(num / 100)
  const rem = num % 100
  if (h) out += `${ONES[h]} Hundred${rem ? ' ' : ''}`
  if (rem) {
    if (rem < 20) out += ONES[rem]
    else out += TENS[Math.floor(rem / 10)] + (rem % 10 ? `-${ONES[rem % 10]}` : '')
  }
  return out
}

export default function numberToWords(value: number): string {
  if (!Number.isFinite(value)) return ''
  const negative = value < 0
  const abs = Math.abs(value)
  const whole = Math.floor(abs)
  const cents = Math.round((abs - whole) * 100)

  let words = ''
  if (whole === 0) {
    words = 'Zero'
  } else {
    const groups: number[] = []
    let n = whole
    while (n > 0) {
      groups.push(n % 1000)
      n = Math.floor(n / 1000)
    }
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i]) words += `${threeDigits(groups[i])}${SCALES[i] ? ` ${SCALES[i]}` : ''} `
    }
    words = words.trim()
  }

  let result = `${negative ? 'Minus ' : ''}${words}`
  if (cents) result += ` and ${String(cents).padStart(2, '0')}/100`
  return result
}
