import { config } from 'dotenv'
import dayjs from 'dayjs'
import snoowrap from 'snoowrap'
import { ProviderConfig } from 'types'
import { writeLog } from 'utils/log'

config()

// Fix https://github.com/not-an-aardvark/snoowrap/issues/221
declare module 'snoowrap' {
  class RedditContent<T> {
    then: undefined
    catch: undefined
    finally: undefined
  }
}

const MAX_LIMIT = 100
const USER_AGENT = 'autodelete.me'
const EDIT_OVERWRITE = 'Wiped by autodelete.me..'

export class RedditProvider {
  private TEST_MODE
  private config: ProviderConfig
  private client: snoowrap

  constructor(config: ProviderConfig, testMode = false) {
    this.TEST_MODE = testMode
    this.config = config

    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || !process.env.REDDIT_USERNAME || !process.env.REDDIT_PASSWORD) {
      console.error('Missing required environment variables. Make sure `.env` is correctly set.')
    }

    this.client = new snoowrap({
      userAgent: USER_AGENT,
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    })

    this.client.config({ debug: true })
  }

  public async Run() {
    console.log('Start Reddit run', this.config)
    const username = (await this.client.getMe().fetch()).name

    console.log('GET Submitted posts for', username)
    const submitted = await this.GetItems(username, 'submitted')
    const submittedToDelete = this.filterItems(submitted)
    console.log('Total submitted posts', submitted.length, 'Posts to delete', submittedToDelete.length)

    const deletedItems = []

    for (let i = 0; i < submittedToDelete.length; i++) {
      const id = submittedToDelete[i].name
      const isSelf = submittedToDelete[i].is_self // only self-posts and comments can get editted

      const deleted = isSelf ? await this.EditAndDeleteItem(id) : await this.DeleteItem(id)
      if (deleted) {
        deletedItems.push(id)
      }
    }

    const comments = await this.GetItems(username, 'comments')
    const commentsToDelete = this.filterItems(comments)
    console.log('Total comments', comments.length, 'Comments to delete', commentsToDelete.length)

    for (let i = 0; i < commentsToDelete.length; i++) {
      const id = commentsToDelete[i].name
      const deleted = await this.EditAndDeleteItem(id)
      if (deleted) {
        deletedItems.push(id)
      }
    }

    console.log('Finished. Items deleted', deletedItems.length)
    writeLog('reddit', deletedItems)
    return deletedItems
  }

  public async GetItems(username: string, resource: 'submitted' | 'comments') {
    const items = []
    let before = this.config.since
    let after = ''
    let hasNext = true
    while (hasNext) {
      let uri = `/user/${username}/${resource}?limit=${MAX_LIMIT}`
      if (before) uri += `&before=${before}`
      if (after) uri += `&after=${after}`

      console.log('  ->', uri)
      const submitted = await this.client.oauthRequest({ uri, method: 'GET' })
      items.push(...submitted)

      if (submitted.length === MAX_LIMIT) {
        if (before) before = submitted[0].name
        else after = submitted[submitted.length - 1].name
      } else {
        hasNext = false
      }
    }

    return items
  }

  public async EditAndDeleteItem(id: string) {
    const edit = await this.EditItem(id)
    if (!edit) return false

    return await this.DeleteItem(id)
  }

  public async EditItem(id: string): Promise<boolean> {
    if (this.TEST_MODE) return true

    try {
      // set timeout to avoid rate limiting issues
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = await this.client.oauthRequest({
        uri: '/api/editusertext',
        method: 'POST',
        form: {
          thing_id: id,
          text: EDIT_OVERWRITE,
        },
      })

      if (!result.success) console.error('Unable to edit item', id)
      return result.success
    } catch (e) {
      console.error('ERROR: Unable to edit item', id)
      return false
    }
  }

  public async DeleteItem(id: string): Promise<boolean> {
    if (this.TEST_MODE) return true

    try {
      // set timeout to avoid rate limiting issues
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await this.client.oauthRequest({
        uri: '/api/del',
        method: 'POST',
        form: {
          id: id,
        },
      })

      return true
    } catch (e) {
      console.error('ERROR: Unable to delete item', id)
      return false
    }
  }

  private filterItems(items: any[]) {
    // TODO: filter on popularity (comments and upvotes)
    // item.num_comments, items.score, items.ups, items.downs

    return items.filter(
      (i) =>
        !this.config.whitelist.includes(i.id) &&
        !this.config.groups.includes(i.subreddit.display_name.toLowerCase()) &&
        dayjs(i.created * 1000).isBefore(dayjs().subtract(this.config.days, 'day')) &&
        !this.config.terms.some(
          (t) =>
            i.url?.toLowerCase().includes(t) ||
            i.title?.toLowerCase().includes(t) ||
            i.selftext?.toLowerCase().includes(t) ||
            i.body?.toLowerCase().includes(t)
        )
    )
  }
}
