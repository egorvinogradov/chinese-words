javascript:(function(){
  if (location.hostname.indexOf('majestic-geese') > -1) {
    var radicals = document.getElementsByTagName('textarea')[0].value.trim().split(/\n/).map(str => {
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

    radicals = radicals.filter(item => item.radical);

    console.log('Parsed radicals', radicals);
    window.chinese_radicals = radicals;

    setTimeout(() => {
      var jsonStr = JSON.stringify(radicals, 0, 2);
      navigator.clipboard.writeText(jsonStr);
    }, 1000);
  }
  else {
    window.open('https://docs.google.com/spreadsheets/d/1KqY_IkkqvL0m-LcqjhLlceGbqbMJqBWwx3EQRnL4IGU');
  }
}());
