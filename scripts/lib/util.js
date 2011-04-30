(function(window, document, $, undefined) {

  // Stolen from zepto.js
  function onDocumentReady(callback) {
    if (document.readyState == 'complete' || document.readyState == 'loaded') {
      callback();
    }
    document.addEventListener('DOMContentLoaded', callback, false);
    return this;
  }

  window.$ = function(id) {
    if (typeof id == "function") {
      onDocumentReady(id);
    } else {
      document.getElementById(id);
    }
  }

  Object.extend = function(obj, props) {
    var prop;
    for (prop in props) {
      if (props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }
  }
  
})(window, window.document, window.$);