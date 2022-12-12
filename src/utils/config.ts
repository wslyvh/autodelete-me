import { config } from 'dotenv'
import { PurgeConfig, TwitterConfig } from 'types'
import settings from '../../settings.json'

export function loadTwitterConfig(): TwitterConfig {
    config()

    if (!process.env.TWITTER_API_KEY ||
        !process.env.TWITTER_API_SECRET ||
        !process.env.TWITTER_ACCESS_TOKEN ||
        !process.env.TWITTER_ACCESS_TOKEN_SECRET
    ) {
        console.error('Missing required environment variables. Make sure `.env` is correctly set.')
        process.exit(1)
    }

    return {
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
}

export function loadPurgeConfig(): PurgeConfig {
    return {
        since_id: settings.since_id || null,
        purge_after: settings.purge_after || 180,
        whitelist: settings.whitelist || []
    }
}