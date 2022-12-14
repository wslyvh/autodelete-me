import dayjs from 'dayjs'
import fs from 'fs'
import JSZip from 'jszip'
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
    const credentials = response.data as Twit.Twitter.User

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

    const tweets: Twit.Twitter.Status[] = []
    const params: Params = { count: count }
    if (purgeConfig.since_id) params.since_id = purgeConfig.since_id

    console.log('Fetching tweets with params', params)
    console.log('This might take a while..')
    while (true) {
        const response = await client.get('statuses/user_timeline', params)
        const data = response.data as Twit.Twitter.Status[]
        tweets.push(...data)

        console.log('Processing tweets', tweets.length)

        // Max. 3200 results limit from Twitter API
        if (data.length === 0 || data.length < count || tweets.length > 3200) break
        if (tweets.length > 0) params.max_id = tweets[tweets.length - 1].id_str
    }

    return withRoot(tweets)
}

export const getArchivedTweets = async (): Promise<Tweet[]> => {
    console.log('Get tweets from archive.')

    const rawArchive = fs.readFileSync('archive.zip')
    const jszip = new JSZip()
    const zip = await jszip.loadAsync(rawArchive)
    const tweetsData = await zip.file('data/tweets.js')?.async('string')
    const tweets = JSON.parse(tweetsData?.replace('window.YTD.tweets.part0 = ', '') ?? '')

    return withRoot(tweets.map((i: any) => i.tweet))
}

export const deleteTweets = (tweets: Tweet[]) => {
    const deleteItems = tweets
        .filter(i =>
            !purgeConfig.whitelist.includes(i.id) ||
            !purgeConfig.whitelist.includes(i.root ?? ''))
        .filter(i => dayjs(i.created_at).isBefore(dayjs().subtract(purgeConfig.purge_after, "day")))
    console.log('Deleting tweets since', dayjs().subtract(purgeConfig.purge_after, "day").format('MMM DD YYYY'), '-', deleteItems.length, 'tweets')

    const promises = deleteItems.map(i => {
        console.log('Delete', i.id, i.root, i.created_at)
        client.post('statuses/destroy/:id', { id: i.id })
    })

    fs.writeFileSync('settings.json', JSON.stringify({
        ...purgeConfig,
        since_id: deleteItems.length > 0 ? deleteItems[deleteItems.length - 1].id : null
    }, null, 2))

    return Promise.allSettled(promises)
}

function withRoot(statuses: Twit.Twitter.Status[]) {
    return statuses.map((i: Twit.Twitter.Status) => {
        const tweet = {
            id: i.id_str,
            created_at: i.created_at,
            text: i.text ?? i.full_text,
            parent: i.in_reply_to_status_id_str,
            root: undefined,
        }
        if (!tweet.parent) return tweet

        let parent = statuses.find(x => x.id_str === tweet.parent)
        while (parent) {
            if (parent.in_reply_to_status_id_str === undefined) {
                return {
                    ...tweet,
                    root: parent.id_str
                }
            }

            parent = statuses.find(x => x.id_str === parent?.in_reply_to_status_id_str)
        }

        return tweet
    })
}