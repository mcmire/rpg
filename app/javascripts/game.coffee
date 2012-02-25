
SCRIPTS = window.SCRIPTS
meta = window.meta

game = {}

scriptsLoaded = []

recordLoadedScripts = ->
  $('script.game').load ->
    name = this.src
      .replace(/^(.+)\/public\/javascripts\/app\//, "")
      .replace(/\.js$/, "")
    scriptsLoaded.push(name)

onAllLoaded = (fn) ->
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

init = ->
  game.main.init()

recordLoadedScripts()
onAllLoaded -> init()

window.game = game
