(function() {
  var onDocumentReady;
  var __hasProp = Object.prototype.hasOwnProperty;
  onDocumentReady = function(callback) {
    if (document.readyState === 'complete' || document.readyState === 'loaded') {
      callback();
    }
    document.addEventListener('DOMContentLoaded', callback, false);
    return this;
  };
  window.$ = function(id) {
    if (typeof id === "function") {
      return onDocumentReady(id);
    } else {
      return document.getElementById(id);
    }
  };
  Object.extend = function(obj, props) {
    var key, val, _ref, _results;
    _ref = props || {};
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      _results.push(obj[key] = val);
    }
    return _results;
  };
}).call(this);
