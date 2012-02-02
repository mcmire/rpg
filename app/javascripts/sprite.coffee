define (require) ->
  meta = require('app/meta2')
  {loadable, tickable, drawable} = require('app/roles')
  Mappable = require('app/mappable')
  Bounds = require('app/bounds')

  # A Sprite is an animated image that lives somewhere on the map and is not
  # collidable.
  #
  # Sprites have the following properties:
  #
  # width      - The integer width, in pixels
  # height     - The integer height, in pixels
  # numFrames  - The integer number of frames
  # frameDelay - The number of frames to skip before starting the animation
  #
  Sprite = meta.def 'game.Sprite',
    loadable,
    tickable,
    drawable,
    Mappable,

    addState: (name, frames, args) ->
      state = {}
      state.name = name
      state.frames = frames
      state.frameDuration = args.duration or args.frameDuration or 1
      state.numFrames = state.frames.length
      state.doesRepeat = args.repeat or args.doesRepeat
      state.afterFinish = args.then
      state.doesMove = args.move or args.doesMove
      if state.moveHandler
        state.doesMove = true
      else if state.doesMove
        state.moveHandler = name
      @states[name] = state

    init: (image, width, height) ->
      @_super()  # Mappable
      @image = image
      @width = width
      @height = height
      @states = {}
      @imagePath = require('app/main').resolveImagePath(@image)

    assignTo: (parent) ->
      @parent = parent
      return this

    load: ->
      self = this
      @image = new Image()
      @image.src = @imagePath
      @image.onload  = -> self.isLoaded = true
      @image.onerror = -> throw "Image #{self.imagePath} failed to load!"

    setState: (name) ->
      @state = @states[name]
      throw new Error "Unknown state '#{name}'!" if not @state
      @currentFrame = 0
      @numSeqFrameDraws = 0
      # console.log "Setting state to #{name}"
      # console.log frames: @state.frames

    tick: ->
      @predraw()
      @draw()
      @postdraw()

    predraw: ->

    draw: ->
      biv = @bounds.inViewport
      ctx = @parent.canvas.ctx

      # ctx.save()

      frame = @state.frames[@currentFrame]
      unless frame?
        debugger
        throw 'frame is undefined'
      yOffset = frame * @height
      ctx.drawImage(@image, 0, yOffset, @width, @height, biv.x1, biv.y1, @width, @height)

      # DEBUG
      # ctx.strokeStyle = '#00ff00'
      # ctx.strokeRect(biv.x1+0.5, biv.y1+0.5, @width, @height)

      # ctx.restore()

    postdraw: ->
      if (@numSeqFrameDraws % @state.frameDuration) is 0
        @currentFrame++

      if @currentFrame is @state.numFrames
        if @state.doesRepeat
          @currentFrame = 0
        else
          if @state.afterFinish
            @setState(@state.afterFinish)
          else
            throw new Error "No after finish state set for '#{@state.name}'!"

      @numSeqFrameDraws++

      @lastBounds.inViewport = @bounds.inViewport.clone()

    inspect: ->
      JSON.stringify
        "bounds.inViewport": @bounds.inViewport.inspect(),
        "bounds.onMap": @bounds.onMap.inspect()

    debug: ->
      console.log "bounds.inViewport = #{@bounds.inViewport.inspect()}"
      console.log "bounds.OnMap = #{@bounds.onMap.inspect()}"

  return Sprite
