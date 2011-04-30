(function(window, document) {
  
  // Stolen from zepto.js
  function onDocumentReady(callback){
    if (document.readyState == 'complete' || document.readyState == 'loaded') callback();
    document.addEventListener('DOMContentLoaded', callback, false); return this;
  }
  
  window.$ = function(id) {
    if (typeof id == "function") {
      onDocumentReady(id);
    } else {
      return document.getElementById(id);
    }
  }
  
})(window, window.document);