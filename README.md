chinese-words
=============

https://chinese.egorvinogradov.com


### Set up locally
1. `git clone git@github.com:egorvinogradov/chinese-words.git`
2. Open https://console.developers.google.com/apis/credentials?project=chinese-mrg and click "**⇩**" to download Google Console credentials.
3. Rename JSON file w/ the credentials into `credentials.json` and put into project root.
4. `npm install`
5. `npm start`

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
