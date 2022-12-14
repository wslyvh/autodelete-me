import { deleteLikes, deleteTweets, getArchivedLikes, getArchivedTweets } from 'client/twitter'

run()

async function run() {
    // Tweets
    const tweets = await getArchivedTweets()
    console.log('Total amount of tweets', tweets.length)

    const deleteResults = await deleteTweets(tweets)
    const deletedTweets = deleteResults.filter(i => i.status === 'fulfilled').length
    console.log('Deleted', deletedTweets, 'tweet(s).')

    // Likes
    const likes = await getArchivedLikes()
    console.log('Total amount of likes', likes.length)

    const likesResult = await deleteLikes(likes)
    const deletedLikes = likesResult.filter(i => i.status === 'fulfilled').length
    console.log('Deleted', deletedLikes, 'like(s).')
}

export { } 
