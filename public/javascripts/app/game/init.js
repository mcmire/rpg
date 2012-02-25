(function() {
  var fn, game, i, main, timer;

  game = (window.game || (window.game = {}));

  main = game.main;

  timer = null;

  i = 0;

  fn = function() {
    var numScripts, numScriptsLoaded, unfoundScripts;
    if (i === 20) {
      unfoundScripts = [];
      $.v.each(window.scripts, function(name) {
        if (window.scriptsLoaded.indexOf(name) === -1) {
          return unfoundScripts.push(name);
        }
      });
      console.log("Not all scripts were loaded! See: " + (unfoundScripts.join(", ")));
      window.clearTimeout(timer);
      timer = null;
      return;
    }
    i++;
    console.log("Checking to see if all scripts have been loaded...");
    numScripts = window.scripts.length;
    numScriptsLoaded = window.scriptsLoaded.length;
    if (numScripts === numScriptsLoaded) {
      console.log("Yup, looks like all scripts are loaded now.");
      window.clearTimeout(timer);
      timer = null;
      return main.init();
    } else {
      return timer = window.setTimeout(fn, 100);
    }
  };

  fn();

  window.scriptLoaded('app/init');

}).call(this);
