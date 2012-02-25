(game = @game).define 'LiveObject', (name) ->
  # A LiveObject represents an object on the map that lives in the foreground
  # layer and is thus collidable. In addition, it can also be programmed to be in
  # different states, such as "alive" or "dead" or "moving left". Finally, a
  # LiveObject has a sprite for an image, which is to say the image is composed of
  # frames, and each state is associated with a slice of those frames. If a slice
  # has only one frame then the object is drawn to have a static image; otherwise,
  # the frames are animated. This animation can either play repeatedly, or stop
  # after it is complete.
  #
  LiveObject = @StillObject.cloneAs(name).extend
    states: {}

    clone: ->
      clone = @_super()
      # Make a copy of the prototype's states so that they don't get shared
      clone.states = game.util.dup(clone.states)
      return clone

    predraw: (ctx) ->
      @currentState.sequence.clear(ctx, @mbounds.x1, @mbounds.y1)
      if fn = @currentState.handler
        if typeof fn is 'function' then @fn() else @[fn]()
        # in calling the handler for the state, the position on the map may have
        # changed, or the viewport may have shifted so the viewport bounds may
        # have changed too
        @recalculateViewportBounds()

    draw: (ctx) ->
      @currentState.sequence.draw(ctx, @mbounds.x1, @mbounds.y1)

    # Public: Add a new state to the state machine.
    #
    # name         - String name of the state (used by #setState).
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
    #                do            - Function or String name of a method to call
    #                                for each tick while the state is active
    #                                (that the sprite will be drawn is already
    #                                taken care of).
    #                then          - Function to call after this state ends
    #                                (i.e. the last frame in the sequence is
    #                                drawn). (Default: nothing)
    #
    addState: (name, frameIndices, opts={}) ->
      state = {}
      state.name = name
      state.handler = opts.do
      state.onEnd = opts.then or name
      seq = game.ImageSequence.create @image, @width, @height, frameIndices,
        frameDelay: opts.frameDelay
        frameDuration: opts.frameDuration
        doesRepeat: opts.doesRepeat
      seq.assignTo(this)
      seq.onEnd(state.onEnd)
      state.sequence = seq
      @states[name] = state

    setState: (name) ->
      @currentState = @states[name]
      @recalculateViewportBounds()
      @currentState.sequence.reset()
      throw new Error "Unknown state '#{name}'!" if not @currentState
      @currentState

    # Public: Move the viewport and map bounds of the player.
    #
    # Signatures:
    #
    # translate(axis, amount)
    #
    #   axis   - A String: 'x' or 'y'.
    #   amount - An integer by which to move the bounds in the axis.
    #
    # translate(obj)
    #
    #   obj - Object:
    #         x - An integer by which to move x1 and x2 (optional).
    #         y - An integer by which to move y1 and y2 (optional).
    #
    # Examples:
    #
    #   translate('x', 20)
    #   translate(x: 2, y: -9)
    #
    # Returns the self-same Viewport.
    #
    # Also see Bounds#translate.
    #
    translate: (args...) ->
      @vbounds.translate(args...)
      @doToMapBounds('translate', args...)

    # Public: Move the X- or Y- bounds of the player by specifying the position
    # of one side of the map bounds. The viewport bounds will be moved
    # accordingly.
    #
    # side  - A String name of the side of the bounds: 'x1', 'x2', 'y1', or 'y2'.
    # value - An integer. The `side` is set to the `value`, and the corresponding
    #         sides are moved accordingly.
    #
    # Returns the integer distance the bounds were moved.
    #
    # Also see Bounds#translateBySide.
    #
    translateBySide: (side, value) ->
      axis = side[0]
      distMoved = @doToMapBounds('translateBySide', side, value)
      @vbounds.translate(axis, distMoved)
      return distMoved

    _initBoundsOnMap: ->
      @_initFence()
      @_super()

    _initFence: ->
      @fence = game.Bounds.rect(0, 0, @map.width, @map.height)

  return LiveObject
