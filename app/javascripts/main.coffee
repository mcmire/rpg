define (require) ->
  {Class, module} = require('app/meta')
  {eventable, attachable} = require('app/roles')
  plug = require('app/plug')
  keyboard = require('app/keyboard')
  core = require('app/core')
  # fpsReporter = require('app/fps_reporter')
  #playerDebugger = require('app/playerDebugger')

  main = meta.def 'game.main',
    eventable,
    attachable,
    tickable,
    runnable

  #main.addPlugin(keyboard)
  #main.addPlugin(core)
  ##main.addPlugin(fpsReporter)
  ##main.addPlugin(playerDebugger)

  main.extend
    imagesPath: '/images'
    debug: false  # or true

    init: ->
      @_super()
      @keyboard = keyboard.init()
      @core = core.assignTo(this).init()
      @attach()
      @addEvents()
      @run()

    setElement: ->
      @$element = $('#main')

    attach: ->
      @core.attach()
      @$element.appendTo(document.body)

    addEvents: ->
      self = this
      @keyboard.addEvents()
      @bindEvents window,
        blur:  -> self.suspend()
        focus: -> self.resume()

    removeEvents: ->
      @keyboard.removeEvents()
      @unbindEvents window, 'blur', 'focus'

    load: (callback) ->
      assetCollections = []
      assetCollections.push require('app/images')
      #assetCollections.push require('app/sounds')
      c.load() for c in assetCollections

      self = this
      i = 0
      ticker = window.setInterval (->
        i++
        if i is 20
          window.clearInterval(ticker)
          ticker = null
          throw new Error "Assets haven't been loaded yet?!"
          return
        console.log "Checking to see if all assets are loaded..."
        isLoaded = (c.isLoaded() for c in assetCollections)
        if isLoaded
          window.clearInterval(ticker)
          ticker = null
          callback()
      ), 100

    run: ->
      main.load -> main.start()
      return this

    start: ->
      @core.start()

    stop: ->
      @core.stop()

    tick: ->
      @core.tick()

    resolveImagePath: (path) ->
      "#{@imagesPath}/#{path}"

  return main
