game = (window.game ||= {})
main = game.main

timer = null
i = 0
fn = ->
  if i is 20
    unfoundScripts = []
    $.v.each window.scripts, (name) ->
      if window.scriptsLoaded.indexOf(name) is -1
        unfoundScripts.push(name)
    console.log "Not all scripts were loaded! See: #{unfoundScripts.join(", ")}"
    window.clearTimeout(timer)
    timer = null
    return
  i++
  console.log "Checking to see if all scripts have been loaded..."
  numScripts = window.scripts.length
  numScriptsLoaded = window.scriptsLoaded.length
  if numScripts is numScriptsLoaded
    console.log "Yup, looks like all scripts are loaded now."
    window.clearTimeout(timer)
    timer = null
    main.init()
  else
    timer = window.setTimeout fn, 100
fn()

window.scriptLoaded('app/init')
