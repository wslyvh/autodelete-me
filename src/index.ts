import { config } from 'dotenv'
import { RedditProvider } from 'providers/reddit'
import { TwitterProvider } from 'providers/twitter'
import { getProviderConfig } from 'utils/config'

const TEST_MODE = false

// Load dotenv config
config()

// Start
run()

async function run() {
  console.log('Running auto-delete.me...')

  const reddit = new RedditProvider(getProviderConfig('reddit'), TEST_MODE)
  await reddit.Run()

  const twitter = new TwitterProvider(getProviderConfig('twitter'), TEST_MODE)
  await twitter.Run()
}

export {}
