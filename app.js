function prepareSearchDict(){
  const words = STORE.var('words').map(item => {
    item.search = normalizeStr(item.chinese + ' ' + item.pinyin + ' ' + item.russian);
    return item;
  });
  STORE.var('words', words);
}


function prepareRadicalDict(){
  const radicals = STORE.var('radicals').map(item => {
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


function isChineseCharacters(str) {
  const re1 = new RegExp('^[\u4E00-\uFA29]*$');
  const re2 = new RegExp('^[\uE7C7-\uE7F3]*$');
  return re1.test(str) || re2.test(str);
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
  let keyword = normalizeStr(text.trim());
  let isRadical = false;
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
  let radicalsObj;
  let radicalsArr;
  if (typeof selectedRadicals === 'string') {
    radicalsObj = {};
    radicalsArr = selectedRadicals.split('');
    radicalsArr.forEach(radical => radicalsObj[radical] = '');
  }
  else {
    radicalsObj = selectedRadicals;
    radicalsArr = Object.keys(selectedRadicals);
  }
  if (radicalsArr.length) {
    return words.filter(word => {
      let matchesCount = 0;
      for (const radical in radicalsObj) {
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
  const selectedRadicals = STORE.var('selectedRadicals');
  const checkbox = e.target;
  const container = checkbox.parentNode.parentNode;
  const {radical, name, defaultName} = container.dataset;

  if (checkbox.checked) {
    selectedRadicals[radical] = name || defaultName;
  }
  else {
    delete selectedRadicals[radical];
  }
  STORE.var('selectedRadicals', selectedRadicals);
  $$$('.search__input').focus();
}


function onRadicalTagRemove(e) {
  const container = e.target.parentNode;
  const {radical} = container.dataset;
  const selectedRadicals = STORE.var('selectedRadicals');
  delete selectedRadicals[radical];
  STORE.var({selectedRadicals});
}


function checkRadicalCheckboxes(selectedRadicals){
  $$('.radicals__checkbox').map(checkbox => {
    const {radical} = checkbox.parentNode.parentNode.dataset;
    checkbox.checked = Boolean(selectedRadicals[radical]);
  });
}


function onClearSearchClick() {
  const input = $$$('.search__input');
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
  $$$('.info__block').hidden = true;
}


function onPlayClick(e) {
  const button = e.target;
  button.classList.add('m-playing');
  responsiveVoice.speak(button.dataset.text, 'Chinese Male', {
    rate: 0.75,
    onend: () => {
      button.classList.remove('m-playing');
    }
  });
}


function onSearchInputKeyup(e) {
  if (!STORE.var('displayedRadicals').length) {
    return;
  }
  const isMoveUp = e.which === 38;
  const isMoveDown = e.which === 40;
  const isEnter = e.which === 13;
  const currentSelection = $$$('.radicals__li.m-selected');

  if (isMoveUp || isMoveDown) {
    let nextSelection;
    if (currentSelection) {
      nextSelection = isMoveUp ? currentSelection.previousElementSibling : currentSelection.nextElementSibling;
    }
    if (!nextSelection) {
      nextSelection = isMoveUp ? $$$('.radicals__li:last-child') : $$$('.radicals__li:first-child');
    }
    currentSelection && currentSelection.classList.remove('m-selected');
    nextSelection.classList.add('m-selected');
  }

  if (isEnter) {
    if (currentSelection) {
      $$$('.radicals__checkbox', currentSelection).click();
    }
  }
}


function onRadicalItemHover(e) {
  $$('.radicals__li').map(item => item.classList.remove('m-selected'));
  e.delegateTarget.classList[e.type === 'mouseover' ? 'add' : 'remove']('m-selected');
}


function onInfoIconClick() {
  $$$('.info__block').hidden = false;
}


function onInfoTagClick(e) {
  const text = e.target.innerText.trim();
  $$$('.search__input').value = text;
  performSearch(text);
}


function initEventBindings(){
  STORE.subscribe('searchParams', (searchParams) => {
    const selectedRadicals = STORE.var('selectedRadicals');
    const {keyword, isRadical} = searchParams;
    let displayedWords;
    let displayedRadicals;
    let displayedLessons;

    if (isRadical) {
      if (keyword && isChineseCharacters(keyword)) {
        displayedWords = getRadicalMatches(keyword, STORE.var('words'));
        displayedRadicals = [];
      }

      // TODO: add search by lesson
      // else if (typeof +keyword === 'number' && +keyword >= 0) {
      //   displayedWords // TODO: match by lesson
      //   displayedRadicals = [];
      //   displayedLessons = []; // TODO: lessons
      // }

      else {
        displayedWords = getRadicalMatches(selectedRadicals, STORE.var('words'));
        displayedRadicals = getSearchMatches(keyword, STORE.var('radicals'));
      }
    }
    else {
      displayedWords = getSearchMatches(keyword, getRadicalMatches(selectedRadicals, STORE.var('words')));
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
  $$$('.search__input').addEventListener('keydown', onSearchInputKeyup);
  $$$('.info__icon').addEventListener('click', onInfoIconClick);
  $$('.info__tag').map(item => item.addEventListener('click', onInfoTagClick));

  $$.delegate('.radicals__li', 'mouseover', onRadicalItemHover);
  $$.delegate('.radicals__li', 'mouseout', onRadicalItemHover);

  $$.delegate('.radicals__checkbox', 'change', onRadicalCheckboxChange);
  $$.delegate('.tags__remove', 'click', onRadicalTagRemove);
  $$.delegate('.words__han', 'click', e => e.target.classList.add('m-selected'));
  $$.delegate('.words__play', 'click', onPlayClick);

  $$.delegate('.tags__remove', 'touchstart', onRadicalTagRemove);
  $$.delegate('.words__han', 'touchstart', e => e.target.classList.add('m-selected'));
  $$.delegate('.words__play', 'touchstart', onPlayClick);
}


async function init(){
  const words = await fetch('/data/words.json').then(data => data.json());
  const radicals = await fetch('/data/radicals.json').then(data => data.json());

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


function getURLParams() {
  const params = {};
  if (location.search) {
    location.search.replace(/^\?/, '').split('&').forEach(pair => {
      params[pair.split('=')[0]] = pair.split('=')[1];
    });
  }
  return params;
}


function saveFile(data, mimeType, filename) {
  const a = document.createElement('a');
  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
  document.body.appendChild(a);
  a.download = filename;
  a.style = 'display: none';
  a.href = href;
  a.click();
}


function handleGoogleDriveAuth(authCode) {
  console.log('Auth code:', authCode);
  saveFile(authCode, 'text/plain', 'auth_code.txt');
  history.replaceState({}, '', location.protocol + '//' + location.host);
}


init();
var authCode = getURLParams().code;
if (authCode) {
  handleGoogleDriveAuth(authCode);
}
