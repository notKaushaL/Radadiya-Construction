import { format, parseISO } from 'date-fns'

// Format date string (YYYY-MM-DD) to display format
export const formatDisplayDate = (dateStr) => {
  try {
    const date = parseISO(dateStr)
    return format(date, 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

// Format amount to Indian currency style
export const formatINR = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

// Today's date in YYYY-MM-DD
export const todayISO = () => new Date().toISOString().split('T')[0]

// Get category icon (Fallback)
export const getCategoryIcon = (category) => {
  return '●'
}

// Get category color class (Strict B&W theme)
export const getCategoryColor = (category) => {
  return 'bg-inherit text-inherit'
}
