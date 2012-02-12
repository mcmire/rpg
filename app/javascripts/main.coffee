game = (window.game ||= {})

meta = game.meta2
{eventable, attachable, tickable, runnable} = game.roles
#fpsReporter = game.fpsReporter
#playerDebugger = game.playerDebugger

main = meta.def 'game.main',
  eventable,
  attachable,
  tickable,
  runnable,

  imagesPath: '/images'
  debug: false  # or true

  init: ->
    @_super(document.body)  # attachable
    @keyboard = game.keyboard.init()
    @core = game.core.init(this)
    @attach()
    @addEvents()
    @run()
    return this

  setElement: ->
    @$element = $('#game')

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
    assetCollections.push(game.imageCollection)
    #assetCollections.push require('app/sounds')

    i = 0
    timer = null
    fn = ->
      i++
      if i is 20
        window.clearTimeout(timer)
        timer = null
        console.log "Not all assets were loaded!"
        return
      console.log "Checking to see if all assets have been loaded..."
      isLoaded = $.v.every assetCollections, (c) -> c.isLoaded()
      if isLoaded
        console.log "Yup, looks like all assets are loaded now."
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

game.main = main

window.scriptLoaded('app/main')
