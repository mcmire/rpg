define (require) ->
  {Class, module} = require('app/meta')
  {eventable, attachable} = require('app/roles')
  plug = require('app/plug')
  keyboard = require('app/keyboard')
  core = require('app/core')
  fpsReporter = require('app/fps_reporter')
  #playerDebugger = require('app/playerDebugger')

  main = module 'game.main',
    eventable,
    attachable,
    plug(
      keyboard,
      core,
      #fpsReporter,
      #playerDebugger,
    ),

    debug: false  # or true

    init: ->
      @_super()
      @$element = $('#main')
      @attach()
      @addEvents()
      @run()

    attach: ->
      #@plugins.attachable.run('attach')
      @_super()
      @$element.appendTo(document.body)

    addEvents: ->
      self = this
      #@plugins.eventable.run('addEvents')
      @_super()
      @bindEvents window,
        blur:  -> self.suspend()
        focus: -> self.resume()

    removeEvents: ->
      #@plugins.eventable.run('removeEvents')
      @_super()
      @unbindEvents window, 'blur', 'focus'

    load: (callback) ->
      @plugins.loadable.run('load')

      self = this
      i = 0
      ticker = window.setInterval (->
        i++
        if i is 20
          window.clearInterval(ticker)
          ticker = null
          throw new Error "Grobs haven't been loaded yet?!"
          return
        console.log "Checking to see if all grobs are loaded..."
        if self.plugins.loadable.every('isLoaded')
          window.clearInterval(ticker)
          ticker = null
          callback()
      ), 100

    run: ->
      main.load -> main.start()
      return this

    # start: ->
    #   @plugins.runnable.run('start')

    # stop: ->
    #   @plugins.runnable.run('stop')

    # suspend: ->
    #   @plugins.runnable.run('suspend')

    # resume: ->
    #   @plugins.runnable.run('resume')

  return main
