import type { WinnerEntry } from '../composables/useLottery'

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Winner log as CSV, oldest draw first. */
export function winnersToCsv(winners: WinnerEntry[]): string {
  const header = ['No.', 'Name', 'Prize', 'Date', 'Time']
  const rows = [...winners]
    .sort((a, b) => a.drawNumber - b.drawNumber)
    .map((w) => [String(w.drawNumber), w.name, w.prize, w.date, w.time])
  return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\r\n')
}
