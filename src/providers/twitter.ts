import dayjs from 'dayjs'
import Twit, { Params } from 'twit'
import { Post, ProviderConfig } from 'types'
import { writeLog } from 'utils/log'

const MAX_LIMIT = 200

export class TwitterProvider {
  private TEST_MODE
  private config: ProviderConfig
  private client: Twit

  constructor(config: ProviderConfig, testMode = false) {
    this.TEST_MODE = testMode
    this.config = config

    if (
      !process.env.TWITTER_API_KEY ||
      !process.env.TWITTER_API_SECRET ||
      !process.env.TWITTER_ACCESS_TOKEN ||
      !process.env.TWITTER_ACCESS_TOKEN_SECRET
    ) {
      console.error('Missing required environment variables. Make sure `.env` is correctly set.')
      process.exit(1)
    }

    this.client = new Twit({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })
  }

  public async Run() {
    console.log('Start Twitter run', this.config)
    
    const deletedItems = []
 
    console.log('GET User timeline')
    const tweets = await this.GetItems()
    const tweetsToDelete = this.filterItems(tweets)
    console.log('Total tweets', tweets.length, 'Tweets to delete', tweetsToDelete.length)

    for (let i = 0; i < tweetsToDelete.length; i++) {
      const id = tweetsToDelete[i].id
      const deleted = await this.DeleteItem(id)
      if (deleted) {
        deletedItems.push(id)
      }
    }

    console.log('GET Likes')
    const likes = await this.GetItems('favorites/list')
    const likesToDelete = this.filterItems(likes)
    console.log('Total likes', likes.length, 'Likes to delete', likesToDelete.length)

    for (let i = 0; i < likesToDelete.length; i++) {
      const id = likesToDelete[i].id
      const deleted = await this.DeleteItem(id, 'favorites/destroy')
      if (deleted) {
        deletedItems.push(id)
      }
    }

    console.log('Finished. Items deleted', deletedItems.length)
    writeLog('twitter', deletedItems)
    return deletedItems
  }

  public async GetItems(resource: 'statuses/user_timeline' | 'favorites/list' = 'statuses/user_timeline') {
    const items = []
    const params: Params = { count: MAX_LIMIT, include_entities: false  }
    if (this.config.since) params.since_id = this.config.since as string

    while (true) {
      console.log(`Fetching ${resource} with params`, params)
      const response = await this.client.get(resource, params)
      const data = response.data as Twit.Twitter.Status[]
      items.push(...data)

      // Max. 3200 results limit from Twitter API
      if (data.length === 0 || items.length > 3200) break
      if (items.length > 0) {
        const maxId = items[items.length - 1].id_str
        if (maxId === params.max_id) break
        params.max_id = maxId
      }
    }

    if (resource === 'statuses/user_timeline') return this.withRoot(items)

    return items.map((i) => {
      return { id: i.id_str, created: i.created_at } as Post
    })
  }

  public async DeleteItem(id: string, resource: 'statuses/destroy/:id' | 'favorites/destroy' = 'statuses/destroy/:id') {
    if (this.TEST_MODE) return true

    try {
      // set timeout to avoid rate limiting issues
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('  ->', resource, id)
      await this.client.post(resource, { id: id })

      return true
    } catch (e) {
      console.log('Unable to delete', id, e)
      return false
    }
  }

  private withRoot(statuses: Twit.Twitter.Status[]) {
    return statuses.map((i: Twit.Twitter.Status) => {
      const tweet: Post = {
        id: i.id_str,
        created: i.created_at,
        text: i.text ?? i.full_text,
        parent: i.in_reply_to_status_id_str,
        root: undefined,
      }
      if (!tweet.parent) return tweet

      let parent = statuses.find((x) => x.id_str === tweet.parent)
      while (parent) {
        if (parent.in_reply_to_status_id_str === undefined) {
          return {
            ...tweet,
            root: parent.id_str,
          }
        }

        parent = statuses.find((x) => x.id_str === parent?.in_reply_to_status_id_str)
      }

      return tweet
    })
  }

  private filterItems(items: Post[]) {
    // TODO: filter on popularity (comments and likes)

    return items.filter(
      (i) =>
        (!this.config.whitelist.includes(i.id) || !this.config.whitelist.includes(i.root ?? '')) &&
        dayjs(i.created).isBefore(dayjs().subtract(this.config.days, 'day')) &&
        !this.config.terms.some((t) => i.text?.toLowerCase().includes(t))
    )
  }
}
