define (require) ->
  meta = require('app/meta2')
  {eventable, attachable, tickable, runnable} = require('app/roles')
  #plug = require('app/plug')
  keyboard = require('app/keyboard')
  core = require('app/core')
  #fpsReporter = require('app/fps_reporter')
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
      @_super(document.body)  # attachable
      @keyboard = keyboard.init()
      @core = core.init(this)
      @attach()
      @addEvents()
      @run()
      return this

    setElement: ->
      @$element = $('#main')

    attach: ->
      @_super()
      @core.attach()
      return this

    addEvents: ->
      self = this
      @keyboard.addEvents()
      @bindEvents window,
        blur:  -> self.suspend()
        focus: -> self.resume()
      return this

    removeEvents: ->
      @keyboard.removeEvents()
      @unbindEvents window, 'blur', 'focus'
      return this

    load: (callback) ->
      self = this

      assetCollections = []
      imageCollection = require('app/images')(this)
      assetCollections.push(imageCollection)
      #assetCollections.push require('app/sounds')

      i = 0
      timer = null
      fn = ->
        i++
        if i is 20
          window.clearTimeout(timer)
          timer = null
          throw new Error "Assets haven't been loaded yet?!"
          return
        console.log "Checking to see if all assets are loaded..."
        isLoaded = $.v.every assetCollections, (c) -> c.isLoaded()
        if isLoaded
          console.log "All assets have been loaded, hey!"
          window.clearTimeout(timer)
          timer = null
          callback()
        else
          timer = window.setTimeout fn, 100
      fn()

      c.load() for c in assetCollections

      return this

    run: ->
      main.load -> main.start()
      return this

    start: ->
      @core.start()
      return this

    stop: ->
      @core.stop()
      return this

    suspend: ->
      console.log "Suspending..."
      @core.suspend()
      return this

    resume: ->
      console.log "Resuming..."
      @core.resume()
      return this

    tick: ->
      @core.tick()

    resolveImagePath: (path) ->
      "#{@imagesPath}/#{path}"

  return main
