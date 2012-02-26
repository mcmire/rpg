
SCRIPTS = window.SCRIPTS
scriptsLoaded = []

loadScripts = ->
  $.v.each SCRIPTS, (url) ->
    name = url
      .replace(/^\/javascripts\/app\//, "")
      .replace(/\.js(.*)$/, ".js")
    script = document.createElement('script')
    script.src = url
    script.onload = ->
      console.log ">> Loaded #{name}"
      scriptsLoaded.push(name)
    $('head').append(script)

whenAllScriptsLoaded = (fn) ->
  timer = null
  i = 0
  check = ->
    if i is 20
      unfoundScripts = (name for name in SCRIPTS when scriptsLoaded.indexOf(name) is -1)
      console.log "Not all scripts were loaded! See: #{unfoundScripts.join(", ")}"
      window.clearTimeout(timer)
      timer = null
      return
    i++
    console.log "Checking to see if all scripts have been loaded..."
    if SCRIPTS.length is scriptsLoaded.length
      console.log "Yup, looks like all scripts are loaded now."
      window.clearTimeout(timer)
      timer = null
      fn()
    else
      timer = window.setTimeout check, 100
  check()

init = ->
  window.game.main.init()

loadScripts()
whenAllScriptsLoaded -> init()
