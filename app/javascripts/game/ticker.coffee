(game = @game).define 'ticker', (name) ->
  ticker = @meta.def name,
    @roles.runnable,
    @roles.tickable,

    isRunning: false

    # override
    _includeMixin: (mixin, opts={}) ->
      opts = $.v.extend {}, opts, keyTranslations: {start: '_start', stop: '_stop'}
      @_super mixin, opts

    destroy: ->
      @stop()

    run: ->
      @start()

    start: ->
      return if @isRunning
      @isRunning = true
      @_start()
      return this

    _start: ->

    stop: ->
      return if not @isRunning
      @isRunning = false
      @_stop()
      return this

    _stop: ->

    suspend: ->
      @wasRunning = @isRunning
      @stop()

    resume: ->
      @start() if @wasRunning

    tick: ->
      throw new Error 'You need to override #tick'

  return ticker
