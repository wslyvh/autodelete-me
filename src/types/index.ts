export interface TwitterConfig {
    TWITTER_API_KEY: string
    TWITTER_API_SECRET: string
    TWITTER_ACCESS_TOKEN: string
    TWITTER_ACCESS_TOKEN_SECRET: string
}

export interface PurgeConfig {
    since_id: string | null
    purge_after: number
    whitelist: string[]
}

export interface UserCredentials {
    id: number
    username: string
}

export interface Tweet {
    id: string,
    created_at: string
}