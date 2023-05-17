// export const getUserCredentials = async (): Promise<UserCredentials> => {
//   console.log('Get User credentials.')
//   const response = await client.get('account/verify_credentials', {
//     skip_status: true,
//   })
//   const credentials = response.data as Twit.Twitter.User

//   if (!credentials.id || !credentials.screen_name) {
//     console.error('Unable to verify user credentials.')
//     process.exit(1)
//   }

//   return {
//     id: credentials.id,
//     username: credentials.screen_name,
//   }
// }

// export const getArchivedTweets = async (): Promise<Tweet[]> => {
//   console.log('Get tweets from archive.')

//   const rawArchive = fs.readFileSync('archive.zip')
//   const jszip = new JSZip()
//   const zip = await jszip.loadAsync(rawArchive)
//   const tweetsData = await zip.file('data/tweets.js')?.async('string')
//   const tweets = JSON.parse(tweetsData?.replace('window.YTD.tweets.part0 = ', '') ?? '')

//   return withRoot(tweets.map((i: any) => i.tweet))
// }

// export const getArchivedLikes = async (): Promise<string[]> => {
//   console.log('Get tweets from archive.')

//   const rawArchive = fs.readFileSync('archive.zip')
//   const jszip = new JSZip()
//   const zip = await jszip.loadAsync(rawArchive)
//   const likesData = await zip.file('data/like.js')?.async('string')
//   const likes = JSON.parse(likesData?.replace('window.YTD.like.part0 = ', '') ?? '')

//   return likes.map((i: any) => i.like.tweetId)
// }
