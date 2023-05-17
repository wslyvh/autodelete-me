# autodelete-me 🧹

Reduce your digital footprint and auto delete your online profiles.

- Protect your privacy
- Reduce your digital footprint
- Don't let your old posts come back to haunt you


> **NOTE**
> 🚧 This product is still in development. Use at your own risk. Deleting posts is irreversible. 


## Getting Started

### Twitter 

1. Sign up and create a project on the [Twitter Developer Portal](https://developer.twitter.com/)
1. Create a new Project and App (select any environment). **Make sure to save your API keys!**
1. Set up 'User authentication settings'
    * App Permissions: Read and Write
    * Type of App: Confidential 
    * Enter any Callback URI and Website URL (e.g. this Github repo). *We're not using this.*
    * No need to save Client Id & Secret. *We're not using this.*
1. Go to your 'Keys and Tokens' > Generate Access Token & Secret
1. go to Keys and tokens to (re-)generate Access Token and Secret. **Make sure to save these keys!**
1. Make sure that after generation your Access Token & Secret are created with read and write permissions 
1. Save the keys to your `.env` file

**NOTE:** The App runs on the Twitter account that you've used to create the developer account & API keys. 

### Reddit

1. Create an App on [Reddit App Preferences](https://www.reddit.com/prefs/apps)
1. Select 'script' as the type of app and use any `redirect uri` (e.g. this Github repo). *We're not using this.*
1. Create App
1. Save the keys to your `.env` file.
    * `REDDIT_CLIENT_ID` is just below your App name and `personal use script`
    * `REDDIT_CLIENT_SECRET` is the created secret
1. Add your personal credentials to your `.env` file 
    * `REDDIT_USERNAME` is your Reddit username
    * `REDDIT_PASSWORD` is your Reddit password

> **NOTE**
> 🚨 MAKE SURE TO NEVER SUBMIT YOUR `.env` OR ANY CREDENTIALS TO GITHUB. 


### Configure 

Your `.env` should be placed in the root of this project and contain the following keys depending on which platforms you'd like to run.

```
TWITTER_API_KEY=''
TWITTER_API_SECRET=''
TWITTER_ACCESS_TOKEN=''
TWITTER_ACCESS_TOKEN_SECRET=''
```

```
REDDIT_CLIENT_ID=''
REDDIT_CLIENT_SECRET=''
REDDIT_USERNAME=''
REDDIT_PASSWORD=''
```

### Settings

The root of this project contains a [settings file](./settings.json) to configure each provider.

### Manual run

You can run a purge manually using the following command.

```
yarn start
```

### Cron Job

The cron job in `.github/workflows` will automatically run on daily basis. Make sure to configure [repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the same variables as your `.env` file.


### Archive 

**CURRENTLY NOT SUPPORTED** 

The Twitter API only returns the last 3200 tweets. This is likely insufficient for most accounts. In order to delete historical tweets, you need to [download an archive of your data](https://twitter.com/settings/download_your_data).

This might take up to 24 hours. Once you have your data, add it to the root of this project with the name `archive.zip`.

> **Note**
> 🚨 Make sure you rename your archive to `archive.zip` or exclude it in `.gitignore`.

You can run a full archive purge using the following command.

```
yarn start:archive
```