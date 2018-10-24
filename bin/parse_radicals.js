javascript:(function(){
  if (location.hostname.indexOf('majestic-geese') > -1) {
    var radicals = document.getElementsByTagName('textarea')[0].value.trim().split(/\n/).map(str => {
      var item = str.trim().split(/\t/);
      return {
        radical: item[0],
        name_russian: item[1],
        is_canonical: !+item[2],
      }
    });
    console.log('Parsed radicals', radicals);
    window.chinese_radicals = radicals;

    setTimeout(() => {
      var jsonStr = JSON.stringify(radicals, 0, 2).replace(/^\[\n\s+/, '').replace(/\n]$/, '');
      navigator.clipboard.writeText(jsonStr);
    }, 1000);
  }
  else {
    window.open('https://docs.google.com/spreadsheets/d/1JWMxFMuSd2o2Ql2r3b5DVdp6Aq8rBncU09AzGteztEI/edit#gid=0');
  }
}());
