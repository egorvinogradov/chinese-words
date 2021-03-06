javascript:(function(){
  if (location.hostname.indexOf('majestic-geese') > -1) {
    var words = document.getElementsByTagName('textarea')[0].value.trim().split(/\n/).map(str => {
      var item = str.trim().split(/\t/);
      return {
        chinese: item[0],
        pinyin: item[1],
        russian: item[2],
        radicals: item[3] || '',
        lesson: +item[4],
      }
    });
    console.log('Parsed words', words);
    window.chinese_words = words;

    setTimeout(() => {
      var jsonStr = JSON.stringify(words, 0, 2);
      navigator.clipboard.writeText(jsonStr);
    }, 1000);
  }
  else {
    window.open('https://docs.google.com/spreadsheets/d/1HsUFYPAqch4DChO28lG--tgJ90BnqlxVKdOxYck1dBQ/edit?usp=sharing');
  }
}());
