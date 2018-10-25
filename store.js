var $$ = function (selector, parent) {
  var elements = selector;
  var parentElement = document;
  if (parent) {
    parentElement = typeof parent === 'string' ? document.querySelector(parent) : parent;
  }
  if (typeof selector === 'string') {
    elements = parentElement.querySelectorAll(selector);
  }
  return Array.prototype.slice.call(elements);
};

var $$$ = function(selector, parent){
  return $$(selector, parent)[0];
};

$$.events = {};

$$.delegate = function(selector, eventType, callback){
  if (!$$.events[selector]) {
    $$.events[selector] = {};
  }
  if (!$$.events[selector][eventType]) {
    $$.events[selector][eventType] = [];
  }
  $$.events[selector][eventType].push(callback);

  window.addEventListener(eventType, e => {
    var matchingElements = $$(selector);
    if (matchingElements.indexOf(e.target) > -1) {
      $$.events[selector][eventType].map(callback => callback(e));
    }
  });
};


var STORE = {

  vars: {},
  subscriptions: {},

  var: function (key, value) {
    if (typeof value === 'undefined' && typeof key !== 'object') {
      var stored = STORE.vars[key];
      if (stored instanceof Array) {
        return stored.slice();
      }
      else if (typeof stored === 'object' && stored) {
        return Object.assign({}, stored);
      }
      else {
        return stored;
      }
    }
    else if (typeof key === 'object') {
      for (var objKey in key) {
        this.updateVar(objKey, key[objKey]);
      }
    }
    else {
      this.updateVar(key, value);
    }
  },

  updateVar: function(key, value){
    if (JSON.stringify(this.vars[key]) !== JSON.stringify(value)) {
      this.setTemplate(key, value);
      this.vars[key] = value;
      if (this.subscriptions[key] && this.subscriptions[key].length) {
        this.subscriptions[key].forEach(callback => callback(value, this.vars[key]));
      }
    }
  },

  subscribe: function(key, callback){
    if (!this.subscriptions[key]) {
      this.subscriptions[key] = [];
    }
    this.subscriptions[key].push(callback);
  },

  setTemplate: function (key, value) {
    $$(`[t-each=${key}]`).map(el => this.setEachTemplate(el, value));
    $$(`[t-show="${key}"], [t-show="${key}|object"]`).map(el => this.setShowTemplate(el, value));
    $$(`[t-var=${key}]`).map(el => this.setVarTemplate(el, value));
  },

  setEachTemplate: function(element, value){
    var templateStr = element.dataset.templateSource || element.innerHTML;
    if (!element.dataset.templateSource) {
      element.dataset.templateSource = templateStr;
    }
    var html = value.map(item => {
      var t = (key) => item[key] || '';
      return eval('`' + templateStr + '`');
    }).join('\n');
    element.innerHTML = html || '';
  },

  setShowTemplate: function(element, value){
    var attrValue = element.getAttribute('t-show');
    var isTrue = value;
    if (/\|object$/i.test(attrValue)) {
      isTrue = value && Object.keys(value).length;
    }
    element.hidden = !isTrue;
  },

  setVarTemplate: function(element, value){
    element.innerHTML = value || '';
  },
};
