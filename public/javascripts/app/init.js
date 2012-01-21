
require(['vendor/ender', 'app/main'], function($, main) {
  return $.domReady(function() {
    return main.init();
  });
});
