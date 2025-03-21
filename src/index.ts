import { config } from 'dotenv'
import 'dotenv/config'
import { RedditProvider } from 'providers/reddit'
import { TwitterProvider } from 'providers/twitter'
import { getProviderConfig } from 'utils/config'
import { fetchTweets } from 'nitter-scraper'

const TEST_MODE = false

// Load dotenv config
config()

// Start
run()

async function run() {
  console.log('Running auto-delete.me...')

  // const reddit = new RedditProvider(getProviderConfig('reddit'), TEST_MODE)
  // await reddit.Run()

  const tweets = await fetchTweets('wslyvh', 3)
  console.log(`Found ${tweets.length} tweets`)
}

export {}
