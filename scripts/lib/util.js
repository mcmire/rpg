(function(window, document, $, undefined) {

  window.$ = function(id) {
    if (typeof id == "function") {
      bean.add(document, 'DOMContentLoaded', id);
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