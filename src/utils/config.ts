import { config } from 'dotenv'
import { ProviderConfig, Providers } from 'types'
import { getLast } from './log'
import appSettings from '../../settings.json'

config()

export function getProviderConfig(provider: Providers) {
  const settings = appSettings as any
  const config = settings[provider] as ProviderConfig

  if (!config) {
    console.error(`Missing config for provider ${provider}`)
    // process.exit(1)
  }

  return {
    type: provider,
    days: config.days ?? 90,
    // 'since' can help reduce API calls to fetch from last deleted item
    // disabled as both providers throw intermittent servers errors that mess up the pointers
    since: undefined, // getLast(provider),
    groups: config.groups ?? [],
    whitelist: config.whitelist ?? [],
    terms: config.terms ?? [],
  }
}
