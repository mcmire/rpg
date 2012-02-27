(function() {
  var definitions, loadedObjects;

  definitions = {};

  loadedObjects = {};

  $.v.extend(window, {
    define: function(name, fn) {
      return definitions[name] = fn;
    },
    require: function(name) {
      var obj;
      obj = loadedObjects[name];
      if (!obj) {
        obj = definitions[name]();
        obj.__name__ = name;
        loadedObjects[name] = obj;
      }
      return obj;
    },
    loadScripts: function(scripts, onLoaded) {
      var check, i, scriptsLoaded, timer;
      scriptsLoaded = [];
      $.v.each(scripts, function(url) {
        var name, script;
        name = url.replace(/^\/javascripts\/app\//, "").replace(/\.js(.*)$/, ".js");
        script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = function() {
          console.log(">> Loaded " + name);
          return scriptsLoaded.push(name);
        };
        return $('#script-loader').prepend(script);
      });
      timer = null;
      i = 0;
      check = function() {
        var name, unfoundScripts;
        if (i === 20) {
          unfoundScripts = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = scripts.length; _i < _len; _i++) {
              name = scripts[_i];
              if (scriptsLoaded.indexOf(name) === -1) _results.push(name);
            }
            return _results;
          })();
          console.log("Not all scripts were loaded! See: " + (unfoundScripts.join(", ")));
          window.clearTimeout(timer);
          timer = null;
          return;
        }
        i++;
        console.log("Checking to see if all scripts have been loaded...");
        if (scripts.length === scriptsLoaded.length) {
          console.log("Yup, looks like all scripts are loaded now.");
          window.clearTimeout(timer);
          timer = null;
          return typeof onLoaded === "function" ? onLoaded() : void 0;
        } else {
          return timer = window.setTimeout(check, 100);
        }
      };
      return check();
    }
  });

}).call(this);
