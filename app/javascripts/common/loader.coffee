
common = (window.common ||= {})

$.v.extend common,
  loadScripts: (group, scripts) ->
    scriptsLoaded = []

    $.v.each scripts, (url) ->
      name = url
        .replace(/^\/javascripts\/app\//, "")
        .replace(/\.js(.*)$/, ".js")
      script = document.createElement('script')
      script.src = url
      script.onload = ->
        console.log ">> Loaded #{name}"
        scriptsLoaded.push(name)
      $('head').append(script)

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
        window.app.onReady?()
      else
        timer = window.setTimeout check, 100
    check()

  ready: (fn) ->
    @onReady = fn
