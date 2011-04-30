(function(window, document, $, undefined) {

  window.$ = function(id) {
    if (typeof id == "function") {
      bean.add(document, 'DOMContentLoaded', id);
    } else {
      document.getElementById(id);
    }
  };

  Object.extend = function(obj, props) {
    var prop;
    for (prop in props) {
      if (props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }
  };
  
  // Returns a random number between min (inclusive) and max (exclusive)
  Math.randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };
  
  // Returns a random integer between min (inclusive) and max (exclusive?)
  // Using Math.round() will give you a non-uniform distribution!
  Math.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
})(window, window.document, window.$);