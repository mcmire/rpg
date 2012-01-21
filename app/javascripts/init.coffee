require ['vendor/ender', 'app/main'], ($, main) ->
  $.domReady -> main.init()
