chinese-words ([chinese-words.surge.sh](http://chinese-words.surge.sh))
=============

Web-app for learning Chinese

<img width="60%" src="https://user-images.githubusercontent.com/1618344/165510169-7af0bcf3-e7e9-4267-9945-d97d11b206ca.gif">

# Docs
[Adding new radicals](#adding-new-radicals)
* [Set up locally](#set-up-locally)
* [Update dictionary](#update-dictionary)
* [Add words from Skritter](#add-words-from-skritter)
* [Deploy to server](#deploy-to-server)


## Adding new radicals

### Set up locally
1. Open https://console.developers.google.com/apis/credentials?project=chinese-mrg and click "**⇩**" to download Google Console credentials.
2. Then:
```bash
# Clone repo
git clone git@github.com:egorvinogradov/chinese-words.git

# Switch to repo folder
cd chinese-words

# Rename JSON file w/ the credentials into credentials.json and put into project root
mv ~/Downloads/client_secret_*.json credentials.json

# Install npm dependencies
npm install

# Run project
npm start
```

### Update dictionary
1. Add new radicals and related strokes to [Chinese MRG: Radicals Spreadsheet](https://docs.google.com/spreadsheets/d/1KqY_IkkqvL0m-LcqjhLlceGbqbMJqBWwx3EQRnL4IGU/edit#gid=1498455902)
2. Add new words and related radicals to [Chinese MRG: Radicals Spreadsheet](https://docs.google.com/spreadsheets/d/1KqY_IkkqvL0m-LcqjhLlceGbqbMJqBWwx3EQRnL4IGU/edit#gid=1498455902)
3. `npm run sync` (or `npm run sync-dev` to redirect to local server)

### Add words from Skritter
1. Go to https://skritter.com/vocablists/view/list12
2. Choose a lesson
3. Launch "Parse Skritter" browser bookmark (`bin/parse_skritter.js`)
4. Paste into [Chinese MRG: Radicals Spreadsheet](https://docs.google.com/spreadsheets/d/1KqY_IkkqvL0m-LcqjhLlceGbqbMJqBWwx3EQRnL4IGU/edit#gid=1498455902)
5. Click "Split text to columns" in the paste context menu.

### Deploy to server
1. `npm run deploy`
