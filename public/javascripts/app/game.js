(function() {
  var SCRIPTS, init, loadScripts, scriptsLoaded, whenAllScriptsLoaded;

  SCRIPTS = window.SCRIPTS;

  scriptsLoaded = [];

  loadScripts = function() {
    return $.v.each(SCRIPTS, function(url) {
      var name, script;
      name = url.replace(/^\/javascripts\/app\//, "").replace(/\.js(.*)$/, ".js");
      script = document.createElement('script');
      script.src = url;
      script.onload = function() {
        console.log(">> Loaded " + name);
        return scriptsLoaded.push(name);
      };
      return $('head').append(script);
    });
  };

  whenAllScriptsLoaded = function(fn) {
    var check, i, timer;
    timer = null;
    i = 0;
    check = function() {
      var name, unfoundScripts;
      if (i === 20) {
        unfoundScripts = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = SCRIPTS.length; _i < _len; _i++) {
            name = SCRIPTS[_i];
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
      if (SCRIPTS.length === scriptsLoaded.length) {
        console.log("Yup, looks like all scripts are loaded now.");
        window.clearTimeout(timer);
        timer = null;
        return fn();
      } else {
        return timer = window.setTimeout(check, 100);
      }
    };
    return check();
  };

  init = function() {
    return window.game.main.init();
  };

  loadScripts();

  whenAllScriptsLoaded(function() {
    return init();
  });

}).call(this);
