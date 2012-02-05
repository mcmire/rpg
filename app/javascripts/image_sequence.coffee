define (require) ->
  meta = require('app/meta2')
  {simpleDrawable} = require('app/roles')

  # An ImageSequence represents slices of frames in an image (i.e. sprite sheet)
  # to facilitate animating between them. A frame lasts for one tick, and then
  # ImageSequence moves to the next frame. When the sequence ends, it may start
  # from the beginning, or it may stop.
  #
  ImageSequence = meta.def 'game.ImageSequence',
    simpleDrawable,

    # Initialize the sprite.
    #
    # image        - An Image object which represents the source image.
    # frameIndices - The Array of Integer frame indices from the source image
    #                that will be animated.
    # opts         - A POJO of options (default: {}):
    #                frameDelay - The Integer number of ticks to wait before
    #                             starting the animation (default: 0).
    #                duration   - The Integer number of ticks each frame
    #                             will last. (Default: 1)
    #                repeat     - Boolean that specifies what happens after
    #                             the last frame is drawn. If true, the
    #                             animation begins again from the first
    #                             frame, otherwise it ends. (Default: false)
    #
    init: (@image, @width, @height, @frameIndices, opts={}) ->
      @numFrames = @frameIndices.length
      # @width = @image.width
      # @height = @image.height / @numFrames  # this should be a perfect integer
      @frameDelay = opts.frameDelay or 0
      @frameDuration = opts.duration or opts.frameDuration or 1
      @doesRepeat = opts.repeat or opts.doesRepeat

      @lastDrawAt = null

    draw: (x, y) ->
      if @frameDelay > 0
        @frameDelay--
        return

      yOffset = @getCurrentFrame() * @height
      @ctx.drawImage(@image, 0, yOffset, @width, @height, x, y, @width, @height)
      @lastDrawAt = [x, y]

      if (@numDraws % @frameDuration) is 0
        @currentFrame++

      if @currentFrame is @numFrames
        if @doesRepeat
          @currentFrame = 0
        else
          @onEndCallback?()

      @numDraws++

    clear: ->
      if @lastDrawAt
        @ctx.clearRect(@lastDrawAt[0], @lastDrawAt[1], @width, @height)

    getCurrentFrame: ->
      frame = @currentState.frames[@currentFrame]
      unless frame?
        debugger
        throw 'frame is undefined'
      return frame

    getYOffset: ->
      @getCurrentFrame() * @height

    onEnd: (callback) ->
      @onEndCallback = callback

  return ImageSequence
