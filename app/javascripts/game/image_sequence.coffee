
define 'game.ImageSequence', ->
  meta = require('meta')
  {assignable, simpleDrawable} = require('roles')

  # An ImageSequence represents slices of frames in an image (i.e. sprite sheet)
  # to facilitate animating between them. A frame lasts for one tick, and then
  # ImageSequence moves to the next frame. When the sequence ends, it may start
  # from the beginning, or it may stop.
  #
  ImageSequence = meta.def \
    assignable,
    simpleDrawable,

    # Initialize the ImageSequence.
    #
    # image        - An Image object which represents the source image.
    # frameIndices - The Array of Integer frame indices from the source image
    #                that will be animated.
    # opts         - A POJO of options (default: {}):
    #                frameDelay    - The Integer number of ticks to wait before
    #                                starting the animation (default: 0).
    #                frameDuration - The Integer number of ticks each frame
    #                                will last. (Default: 1)
    #                doesRepeat    - Boolean that specifies what happens after
    #                                the last frame is drawn. If true, the
    #                                animation begins again from the first
    #                                frame, otherwise it ends. (Default: false)
    #
    init: (@name, @image, @width, @height, @frameIndices, opts={}) ->
      @numFrames = @frameIndices.length
      # @width = @image.width
      # @height = @image.height / @numFrames  # this should be a perfect integer
      @frameDelay = opts.frameDelay or 0
      @frameDuration = opts.frameDuration or 1
      @doesRepeat = opts.doesRepeat
      @reset()

    reset: ->
      @numDraws = 0
      @currentFrame = 0
      @lastDrawAt = null

    draw: (ctx, x, y) ->
      if @frameDelay > 0
        @frameDelay--
        return

      yOffset = @getCurrentFrame() * @height
      # ctx.strokeStyle = '#ff0000'
      # ctx.strokeRect(x+0.5, y+0.5, @width-0.5, @height-0.5)
      ctx.drawImage(@image.element, 0, yOffset, @width, @height, x, y, @width, @height)
      @lastDrawAt = [x, y]

      if (@numDraws % @frameDuration) is 0
        @currentFrame++

      if @currentFrame is @numFrames
        if @doesRepeat
          @currentFrame = 0
        else
          @onEndCallback?()

      @numDraws++

      return

    clear: (ctx, x, y) ->
      return unless @lastDrawAt
      # if @parent?.__name__ is 'game.player'
        # console.log "clearing player image seq at (#{@lastDrawAt[0]}, #{@lastDrawAt[1]})"
      ctx.clearRect(@lastDrawAt[0], @lastDrawAt[1], @width, @height)

    getCurrentFrame: ->
      frame = @frameIndices[@currentFrame]
      unless frame?
        throw new Error 'frame is undefined'
      return frame

    getYOffset: ->
      @getCurrentFrame() * @height

    onEnd: (callback) ->
      @onEndCallback = callback

  return ImageSequence
