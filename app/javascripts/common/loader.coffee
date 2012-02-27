
definitions = {}
loadedObjects = {}

$.v.extend window,
  define: (name, fn) ->
    definitions[name] = fn

  require: (name) ->
    obj = loadedObjects[name]
    unless obj
      obj = definitions[name]()
      obj.__name__ = name
      loadedObjects[name] = obj
    return obj

  loadScripts: (scripts, onLoaded) ->
    scriptsLoaded = []

    $.v.each scripts, (url) ->
      name = url
        .replace(/^\/javascripts\/app\//, "")
        .replace(/\.js(.*)$/, ".js")
      script = document.createElement('script')
      script.src = url
      script.async = true
      script.onload = ->
        console.log ">> Loaded #{name}"
        scriptsLoaded.push(name)
      $('#script-loader').prepend(script)

    timer = null
    i = 0
    check = ->
      if i is 20
        unfoundScripts = (name for name in scripts when scriptsLoaded.indexOf(name) is -1)
        console.log "Not all scripts were loaded! See: #{unfoundScripts.join(", ")}"
        window.clearTimeout(timer)
        timer = null
        return
      i++
      console.log "Checking to see if all scripts have been loaded..."
      if scripts.length is scriptsLoaded.length
        console.log "Yup, looks like all scripts are loaded now."
        window.clearTimeout(timer)
        timer = null
        onLoaded?()
      else
        timer = window.setTimeout check, 100
    check()
