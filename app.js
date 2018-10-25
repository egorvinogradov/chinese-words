function prepareSearchDict(){
  var words = STORE.var('words').map(item => {
    item.search = normalizeStr(item.chinese + ' ' + item.pinyin + ' ' + item.russian);
    return item;
  });
  STORE.var('words', words);
}


function prepareRadicalDict(){
  var radicals = STORE.var('radicals').map(item => {
    item.search = normalizeStr(item.radical + ' ' + item.name_russian);
    return item;
  });
  STORE.var('radicals', radicals);
}


function normalizeStr(str){
  return str.toLowerCase()
    .replace(/[\s+⟨⟩\-_,';\?\!\.]+/g, '')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[ūúǔùüǖǘǚǜ]/g, 'u');
}


function initSearch(){
  prepareSearchDict();
  prepareRadicalDict();

  $$$('.search__input').addEventListener('keyup', (e) => {
    if (!STORE.var('isSearching')) {
      STORE.var('isSearching', true);
      setTimeout(() => {
        STORE.var('isSearching', false);
        performSearch(e.target.value);
      }, 200);
      performSearch(e.target.value);
    }
  });
  $$$('.search__clear').addEventListener('click', onClearSearchClick);
}


function performSearch(text){
  var keyword = normalizeStr(text.trim());
  var isRadical = false;
  if (/^\//i.test(keyword)) {
    keyword = keyword.replace(/^\//, '');
    isRadical = true;
  }
  STORE.var({
    searchParams: {
      keyword,
      isRadical,
    }
  });
}


function getSearchMatches(keyword, words) {
  return words.filter(item => {
    return item.search.indexOf(keyword) > -1;
  });
}


function getRadicalMatches(selectedRadicals, words) {
  var radicalsArr = Object.keys(selectedRadicals);
  if (radicalsArr.length) {
    return words.filter(word => {
      var matchesCount = 0;
      for (var radical in selectedRadicals) {
        if (word.radicals.indexOf(radical) > -1) {
          matchesCount++;
        }
      }
      return radicalsArr.length === matchesCount;
    });
  }
  else {
    return words;
  }
}


function onRadicalCheckboxChange(e) {
  var selectedRadicals = STORE.var('selectedRadicals');
  var checkbox = e.target;
  var container = checkbox.parentNode.parentNode;
  var {radical, name} = container.dataset;

  if (checkbox.checked) {
    selectedRadicals[radical] = name;
  }
  else {
    delete selectedRadicals[radical];
  }
  STORE.var('selectedRadicals', selectedRadicals);
}


function onRadicalTagRemove(e) {
  var container = e.target.parentNode;
  var {radical} = container.dataset;
  var selectedRadicals = STORE.var('selectedRadicals');
  delete selectedRadicals[radical];
  STORE.var({selectedRadicals});
}


function checkRadicalCheckboxes(selectedRadicals){
  $$('.radicals__checkbox').map(checkbox => {
    var {radical} = checkbox.parentNode.parentNode.dataset;
    checkbox.checked = Boolean(selectedRadicals[radical]);
  });
}


function onClearSearchClick() {
  var input = $$$('.search__input');
  input.value = '';
  input.focus();
  STORE.var({
    displayedWords: getRadicalMatches(STORE.var('selectedRadicals'), STORE.var('words')),
    displayedRadicals: [],
    searchKeyword: null,
  });
}


function preventDefaultBrowserSearchInvocation(e){
  if (e.which === 70 && (e.ctrlKey || e.metaKey)) {
    $$$('.search__input').focus();
    e.preventDefault();
    return false;
  }
}


function hidePopups(){
  STORE.var({displayedRadicals: []});
  $$('.words__han.m-selected').map(item => item.classList.remove('m-selected'));
}


function onPlayClick(e) {
  var button = e.target;
  button.classList.add('m-playing');
  responsiveVoice.speak(button.dataset.text, 'Chinese Male', {
    rate: 0.75,
    onend: () => {
      button.classList.remove('m-playing');
    }
  });
}


function initEventBindings(){
  STORE.subscribe('searchParams', (searchParams) => {
    var selectedRadicals = STORE.var('selectedRadicals');
    var displayedWords;
    var displayedRadicals;

    if (searchParams.isRadical) {
      displayedWords = getRadicalMatches(selectedRadicals, STORE.var('words'));
      displayedRadicals = getSearchMatches(searchParams.keyword, STORE.var('radicals'));
    }
    else {
      displayedWords = getSearchMatches(searchParams.keyword, getRadicalMatches(selectedRadicals, STORE.var('words')));
      displayedRadicals = [];
    }
    STORE.var({
      displayedWords,
      displayedRadicals,
    });
  });

  STORE.subscribe('displayedRadicals', () => {
    checkRadicalCheckboxes(STORE.var('selectedRadicals'));
  });

  STORE.subscribe('selectedRadicals', (selectedRadicals) => {
    checkRadicalCheckboxes(selectedRadicals);

    STORE.var({
      tags: Object.keys(selectedRadicals).map(radical => {
        return {
          radical,
          name: selectedRadicals[radical],
        };
      }),
      displayedWords: getRadicalMatches(selectedRadicals, STORE.var('words')),
    });
  });

  window.addEventListener('click', (e) => {
    if (!$$$('.search').contains(e.target)) {
      hidePopups();
    }
  }, true);

  window.addEventListener('touchstart', e => {
    if (!$$$('.search').contains(e.target)) {
      hidePopups();
    }
  });

  window.addEventListener('keyup', e => (e.which === 27 /* Esc */ ) && hidePopups() );
  window.addEventListener('keydown', preventDefaultBrowserSearchInvocation);

  $$.delegate('.radicals__checkbox', 'change', onRadicalCheckboxChange);
  $$.delegate('.tags__remove', 'click', onRadicalTagRemove);
  $$.delegate('.words__han', 'click', e => e.target.classList.add('m-selected'));
  $$.delegate('.words__play', 'click', onPlayClick);
}


async function init(){
  var words = await fetch('/data/words.json').then(data => data.json());
  var radicals = await fetch('/data/radicals.json').then(data => data.json());

  STORE.var({
    words,
    radicals,
    tags: [],
    displayedWords: words,
    displayedRadicals: [],
    selectedRadicals: {},
    searchParams: {},
  });

  initEventBindings();
  initSearch();
}

init();
