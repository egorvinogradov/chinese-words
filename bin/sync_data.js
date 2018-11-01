const fs = require('fs');
const {google} = require('googleapis');
const {exec} = require('child_process');



function authorizeInGoogleDrive(credentials, callback) {
  const isDev = process.argv.indexOf('--dev') > -1;
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const redirectURL = redirect_uris[isDev ? 1 : 0];
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectURL);
  const authURL = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
  });
  const authCodeFilePath = `${process.env.HOME}/Downloads/auth_code.txt`;
  let authWaitInterval;
  let authMaxWaitTimeout;

  exec(`google-chrome "${authURL}"`);

  authWaitInterval = setInterval(() => {
    console.log('Checking auth...', authCodeFilePath);
    if (fs.existsSync(authCodeFilePath)) {
      fs.readFile(authCodeFilePath, 'utf8', (err, code) => {
        if (!err) {
          console.log('Received auth code:', code);
          fs.unlinkSync(authCodeFilePath);
          clearInterval(authWaitInterval);
          clearTimeout(authMaxWaitTimeout);

          oAuth2Client.getToken(code, (err, token) => {
            oAuth2Client.setCredentials(token);
            callback(oAuth2Client);
          });
        }
      });
    }
  }, 500);

  authMaxWaitTimeout = setTimeout(() => {
    console.log('Time exceeded, no auth file found');
    clearInterval(authWaitInterval);
  }, 30 * 1000);
}



function exportFileFromGoogleDrive(drive, fileId, mimeType) {
  return new Promise((resolve) => {
    drive.files.export({fileId, mimeType}, (err, response) => {
      if (!err) {
        resolve(response.data);
      }
    });
  });
}



function parseRadicalsTSV(tsvText){
  var radicals = tsvText.trim().split(/\n/).map(str => {
    var item = str.trim().split(/\t/);
    var data = {
      radical: item[0],
      name_russian: item[1] || null,
      strokes: item[2],
    };
    var nonCanonical = Boolean(+item[3]);
    if (nonCanonical) {
      data.non_canonical = nonCanonical;
    }
    return data;
  });
  return radicals.filter(item => item.radical);
}



function parseWordsTSV(tsvText){
  return tsvText.trim().split(/\n/).map(str => {
    var item = str.trim().split(/\t/);
    return {
      chinese: item[0],
      pinyin: item[1],
      russian: item[2],
      radicals: item[3] || '',
      lesson: +item[4],
    }
  });
}



function parseRadicalLine(line){
  var exceptions = {
    '𠂇': ['𠂇'],
    '𤴓': ['𤴓'],
    '𠂇月': ['𠂇', '月'],
    '日𤴓': ['日', '𤴓'],
    '𤴓土己': ['𤴓', '土', '己'],
    '亻𠂇土': ['亻', '𠂇', '土'],
    '月𠂇又': ['月', '𠂇', '又'],
  };
  var chars = line.split('');
  if (exceptions[line]) {
    chars = exceptions[line];
  }
  return chars;
}



function dedupeString(str){
  var charObj = {};
  parseRadicalLine(str).forEach(char => { charObj[char] = 1; });
  return Object.keys(charObj).join('');
}



function enrichWordRadicals(words, radicals){
  var radicalStrokesObject = {};
  radicals.forEach(item => {
    radicalStrokesObject[item.radical] = item.strokes;
  });

  return words.map(word => {
    // 1. Enrich by radicals from other words w/ same characters
    if (word.chinese.length > 1) {
      words.forEach(matchWord => {
        if (word.chinese.indexOf(matchWord.chinese) > -1) {
          word.radicals += matchWord.radicals;
        }
      });
    }

    // 2. Enrich w/ radical compounds
    var radicalArr = parseRadicalLine(word.radicals);
    word.radicals += radicalArr.map(radical => radicalStrokesObject[radical]).join('');

    // 3. Remove radical duplicates
    word.radicals = dedupeString(word.radicals);

    return word;
  });
}



async function initSync(auth) {
  const drive = google.drive({version: 'v3', auth});
  const mimeType = 'text/tab-separated-values';

  const radicalsTSV = await exportFileFromGoogleDrive(drive, '1KqY_IkkqvL0m-LcqjhLlceGbqbMJqBWwx3EQRnL4IGU', mimeType);
  const wordsTSV = await exportFileFromGoogleDrive(drive, '1HsUFYPAqch4DChO28lG--tgJ90BnqlxVKdOxYck1dBQ', mimeType);

  const radicals = parseRadicalsTSV(radicalsTSV);
  const words = parseWordsTSV(wordsTSV);
  const enrichedWords = enrichWordRadicals(words, radicals);

  console.log('\n\n\n\n\n\n', enrichedWords, '\n\n\n\n\n\n');
  console.log('\n\n\n\n\n\n', radicals);

  fs.writeFileSync('data/words.json', JSON.stringify(enrichedWords, null, 2));
  fs.writeFileSync('data/radicals.json', JSON.stringify(radicals, null, 2));
}



fs.readFile('credentials.json', (err, content) => {
  authorizeInGoogleDrive(JSON.parse(content), initSync);
});
