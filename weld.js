/*!
 * weld.js v1.x (https://github.com/pimbrouwers/weld.js)
 * Copyright 2020 Pim Brouwers
 * Licensed under Apache 2.0 (https://github.com/pimbrouwers/weld.js/blob/master/LICENSE)
 */

function weld() {
  var _bindings = [];
  var _binders = {};

  return {
    addBinder: function (name, b) {
      _binders[name] = b;
    },
    applyBindings: function (el) {
      traverseDomForBindings(el === undefined ? document.body : el);
      window.addEventListener('unload', unloadBindings);
      executeBindings();
    }
  };

  function executeBindings() {
    _bindings.forEach(function (b) {
      if (_binders[b.name])
        _binders[b.name](b.el, b.value, b.additional);
    });
  }

  function getAttr(el, key) {
    var attr = el.getAttributeNode(key);
    return attr ? attr.value : null;
  }

  function parseBindingString(el) {
    var bindingStr = getAttr(el, 'data-bind');

    if (bindingStr === null)
      return null;

    var fn = fn = 'return {' + bindingStr.replace(/[\r\n]/g, '') + '}';
    var binding;
    var bindingName;
    var bindingValue;
    var additional = {};

    try {
      var binding = new Function(fn)();
    }
    catch {				
      console.warn('Invalid binding string: ' + bindingStr);
    }

    if (!binding) return null;

    var keys = Object.keys(binding);
    bindingName = keys[0];
    bindingValue = binding[bindingName];
    
    if (keys.length > 1) {
      delete binding[bindingName];
      additional = binding;
    }

    return {
      el: el,
      name: bindingName,
      value: bindingValue,
      additional: additional
    };
  }

  function traverseDomForBindings(el) {
    for (var i = 0; i < el.children.length; i++)
      traverseDomForBindings(el.children.item(i));

    var binding = parseBindingString(el);
    if (binding !== null)
      _bindings.push(binding);
  }

  function unloadBindings() {
    var removeEventListeners = function (el) {
      return el.parentNode.replaceChild(el.cloneNode(true), el);
    };
    for (var i = 0; i < _bindings.length; i++)
      removeEventListeners(_bindings[i].el);
  }
};

var w = weld();

if (typeof module !== "undefined") module["exports"] = w;
else window.weld = w;