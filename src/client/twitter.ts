import dayjs from 'dayjs'
import fs from 'fs'
import Twit, { Params } from 'twit'
import { Tweet, UserCredentials } from 'types'
import { loadPurgeConfig, loadTwitterConfig } from 'utils/config'

console.log('Loading configurations.')
const count = 200
const twitterConfig = loadTwitterConfig()
const purgeConfig = loadPurgeConfig()

console.log('Initialize Twitter client.')
const client = new Twit({
    consumer_key: twitterConfig.TWITTER_API_KEY,
    consumer_secret: twitterConfig.TWITTER_API_SECRET,
    access_token: twitterConfig.TWITTER_ACCESS_TOKEN,
    access_token_secret: twitterConfig.TWITTER_ACCESS_TOKEN_SECRET,
})

export const getUserCredentials = async (): Promise<UserCredentials> => {
    console.log('Get User credentials.')
    const response = await client.get('account/verify_credentials', { skip_status: true })
    const credentials = response.data as any

    if (!credentials.id || !credentials.screen_name) {
        console.error('Unable to verify user credentials.')
        process.exit(1)
    }

    return {
        id: credentials.id,
        username: credentials.screen_name
    }
}

export const getUserTimeline = async (): Promise<Tweet[]> => {
    console.log('Get User timeline.')

    const tweets: any[] = []
    const params: Params = { count: count }
    if (purgeConfig.since_id) params.since_id = purgeConfig.since_id

    let recursive = true
    console.log('Fetching tweets with params', params)
    console.log('This might take a while..')
    while (recursive) {
        const response = await client.get('statuses/user_timeline', params)
        const data = response.data as any[]
        tweets.push(...data.map((i: any) => {
            return {
                id: i.id_str,
                created_at: i.created_at,
                text: i.text,
                parent: i.in_reply_to_status_id_str
            }
        }))

        console.log('Processing tweets', tweets.length)

        // Max. 3200 results limit from Twitter API
        if (data.length === 0 || data.length < count || tweets.length > 3200) break
        if (tweets.length > 0) params.max_id = tweets[tweets.length - 1].id
    }

    // Traverse parents to protect whitelisted threads from root
    return tweets.map((i: any) => {
        if (!i.parent) return i

        let parent = tweets.find(x => x.id === i.parent)
        while (parent) {
            if (parent.parent === null) {
                return {
                    ...i,
                    root: parent.id
                }
            }

            parent = tweets.find(x => x.id === parent.parent)
        }

        return i
    })
}

export const deleteTweets = (tweets: Tweet[]) => {
    const deleteItems = tweets
        .filter(i =>
            !purgeConfig.whitelist.includes(i.id) ||
            !purgeConfig.whitelist.includes(i.root ?? ''))
        .filter(i => dayjs(i.created_at).isBefore(dayjs().subtract(purgeConfig.purge_after, "day")))
    console.log('Deleting tweets since', dayjs().subtract(purgeConfig.purge_after, "day").format('MMM DD YYYY'), '-', deleteItems.length, 'tweets')

    const promises = deleteItems.map(i => {
        console.log('Delete', i.id, i.created_at)
        client.post('statuses/destroy/:id', { id: i.id })
    })

    fs.writeFileSync('settings.json', JSON.stringify({
        ...purgeConfig,
        since_id: deleteItems.length > 0 ? deleteItems[deleteItems.length - 1].id : null
    }, null, 2))

    return Promise.allSettled(promises)
}
