// Bikram Sambat (BS) ↔ Anno Domini (AD) conversion
// BS year starts ~mid-April in AD. Table covers 2000–2090 BS.

const BS_MONTHS = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra']
const BS_MONTHS_NP = ['बैशाख','जेठ','असाढ','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र']
const DAYS_NP = ['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार']
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// Days in each month for BS years 2000–2090
// Each entry: [year, [days in baisakh..chaitra]]
const BS_DATA = {
  2077: [31,32,31,32,31,30,30,30,29,30,29,31],
  2078: [31,31,32,32,31,30,30,30,29,30,30,30],
  2079: [31,32,31,32,31,30,30,30,29,30,29,31],
  2080: [31,32,31,32,31,30,30,30,29,30,30,30],
  2081: [31,31,32,31,31,31,30,29,30,29,30,30],
  2082: [31,31,32,32,31,30,30,29,30,29,30,30],
  2083: [31,32,31,32,31,30,30,30,29,29,30,31],
  2084: [31,31,31,32,31,31,29,30,29,30,29,31],
  2085: [31,31,32,31,31,31,30,29,30,29,30,30],
  2086: [31,32,31,32,31,30,30,29,30,29,30,30],
  2087: [31,32,31,32,31,30,30,30,29,30,29,31],
  2088: [30,32,31,32,31,30,30,30,29,30,30,30],
  2089: [31,31,32,31,31,30,30,30,29,30,30,30],
  2090: [31,31,32,31,31,30,30,30,29,30,29,31],
}

// AD start date for BS 2077 Baisakh 1 = April 13, 2020
const BS_START = { year: 2077, month: 1, day: 1 }
const AD_START = new Date(2020, 3, 13) // April 13, 2020

function adToBS(adDate) {
  const date = new Date(adDate)
  date.setHours(0, 0, 0, 0)

  // Days since AD_START
  const diff = Math.floor((date - AD_START) / 86400000)
  if (diff < 0) return null

  let remaining = diff
  let bsYear = BS_START.year
  let bsMonth = 1
  let bsDay = 1

  // Walk through BS months
  outer: while (true) {
    const monthDays = BS_DATA[bsYear]
    if (!monthDays) break
    for (let m = 0; m < 12; m++) {
      const days = monthDays[m]
      if (remaining < days) {
        bsDay = remaining + 1
        bsMonth = m + 1
        break outer
      }
      remaining -= days
    }
    bsYear++
  }

  return { year: bsYear, month: bsMonth, day: bsDay }
}

function toNepaliDigit(n) {
  const d = ['०','१','२','३','४','५','६','७','८','९']
  return String(n).split('').map((c) => (/[0-9]/.test(c) ? d[parseInt(c)] : c)).join('')
}

export function formatBS(adDate, opts = {}) {
  const bs = adToBS(adDate)
  if (!bs) return ''
  const { nepali = false } = opts
  if (nepali) {
    return `${toNepaliDigit(bs.day)} ${BS_MONTHS_NP[bs.month - 1]} ${toNepaliDigit(bs.year)}`
  }
  return `${bs.day} ${BS_MONTHS[bs.month - 1]} ${bs.year}`
}

export function formatBoth(adDate) {
  const ad = new Date(adDate)
  const adStr = ad.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  const bsStr = formatBS(adDate)
  return bsStr ? `${bsStr} BS (${adStr})` : adStr
}

export function getDayName(adDate, nepali = false) {
  const dow = new Date(adDate).getDay()
  return nepali ? DAYS_NP[dow] : DAYS_EN[dow]
}

export function getWeekDates(referenceDate = new Date()) {
  const date = new Date(referenceDate)
  const dow = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export { BS_MONTHS, BS_MONTHS_NP, DAYS_EN, DAYS_NP }
