/*
TODO:
1. Go to https://skritter.com/vocablists/view/list12
2. Run code (via bookmark)
3. Paste into Google Spreadsheets
4. Click Data -> Split text into columns
*/

javascript:csvString = $('#vocablist-section-rows .row').toArray().map(row => {
  var chinese = $('.vocab-writing', row).eq(0).text().trim();
  var pinyin = $('.vocab-reading', row).text().trim().split(',')[0];
  var english = $('.vocab-definition', row).text().trim();
  return `${chinese},${pinyin},,${english}`;
}).join('\n');

chineseLetters = csvString.split('\n').map(str => str.split(',')[0]).join('\n');

window.open(`https://translate.google.com/?source=osdd#zh-CN/ru/${encodeURIComponent(chineseLetters)}`);
window.open('https://docs.google.com/spreadsheets/d/1HsUFYPAqch4DChO28lG--tgJ90BnqlxVKdOxYck1dBQ/edit#gid=0');
window.open(`https://majestic-geese.egorvinogradov.com/?text=${encodeURIComponent(csvString)}`);
