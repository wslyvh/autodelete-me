export type Providers = 'twitter' | 'reddit'

export interface ProviderConfig {
  type: Providers
  days: number
  since: string | number | undefined
  groups: string[]
  whitelist: string[]
  terms: string[]
}

export interface Post {
  id: string
  created: string
  text?: string | undefined
  parent?: string | undefined
  root?: string | undefined
}
