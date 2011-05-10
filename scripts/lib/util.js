(function(window, document, $, _, undefined) {

  window.$ = function(id) {
    if (typeof id == "function") {
      bean.add(document, 'DOMContentLoaded', id);
    } else {
      return document.getElementById(id);
    }
  };

  window.get = function(url, callback) {
    var xhr;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState==4 && xhr.status==200) {
        callback(xhr.responseText, xhr);
      }
    }
    xhr.open("GET", url, true);
    xhr.send(null);
  };

  Object.extend = function(obj, props) {
    var prop;
    for (prop in props) {
      if (props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }
    return obj;
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
  
  // <http://stackoverflow.com/questions/610406/javascript-printf-string-format>
  String.format = function(/* str, var1, var2, ... */) {
    var args = Array.prototype.slice.call(arguments);
    var str = args.shift();
    for (var i = 0; i < args.length; i++) {
      var regexp = new RegExp('\\{'+i+'\\}', 'gi');
      str = str.replace(regexp, args[i]);
    }
    return str;
  };
  
  String.capitalize = function(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
  }
  
})(window, window.document, window.$, window._);
