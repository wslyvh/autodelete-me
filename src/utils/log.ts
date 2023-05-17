import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'
import { Providers } from 'types'

export function writeLog(provider: Providers, data: string[]) {
  if (data.length === 0) return

  const filename = path.join('logs', provider, `${dayjs().format('YYYYMMDD_HHmm')}.json`)
  fs.mkdirSync(path.dirname(filename), { recursive: true })
  fs.writeFileSync(filename, JSON.stringify(data, null, 2))
}

export function getLast(provider: Providers) {
  const dir = path.join('logs', provider)
  const files = fs.readdirSync(dir, { withFileTypes: true }).filter((i) => i.isFile() && i.name.endsWith('.json'))

  if (files.length) {
    const last = files.sort((a, b) => b.name.localeCompare(a.name))[0]
    const filename = path.join(dir, last.name)
    const data = JSON.parse(fs.readFileSync(filename, 'utf8')) as string[]
    if (data && data.length > 0) {
      return data[0]
    }
  }
}
