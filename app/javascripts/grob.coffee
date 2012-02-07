game = (window.game ||= {})

meta = game.meta2
{assignable, drawable} = game.roles
Mappable = game.Mappable
#Collidable = game.Collidable
ImageSequence = game.ImageSequence

# A Grob is a GRaphical OBject. Grobs are located on the map and live in the
# foreground (collision) layer. They can also be programmed to be in different
# states, such as "alive" or "dead". Finally, a grob has a sprite for an
# image, which is to say the image is composed of frames, and each state is
# associated with a slice of those frames. If a slice has only one frame then
# the grob is drawn to have a static image; otherwise, the frames are
# animated. This animation can either play repeatedly, or stop after it is
# complete.
#
Grob = meta.def 'game.Grob',
  assignable,
  drawable,    # implies tickable
  Mappable,
  #Collidable,  # implies Mappable

  states: {}

  clone: ->
    clone = @_super()
    # Make a copy of the prototype's states so that they don't get shared
    clone.states = game.util.dup(clone.states)
    return clone

  init: (imagePath, @width, @height) ->
    @_super()  # Mappable
    @image = game.imageCollection.get(imagePath)

  predraw: ->
    if fn = @currentState.handler
      if typeof fn is 'function' then @fn() else @[fn]()

  draw: ->
    biv = @bounds.inViewport
    @currentState.sequence.draw(@ctx, biv.x1, biv.y1)

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
    throw new Error "Unknown state '#{name}'!" if not @currentState
    @currentState

  inspect: ->
    JSON.stringify
      "bounds.inViewport": @bounds.inViewport.inspect(),
      "bounds.onMap": @bounds.onMap.inspect()

  debug: ->
    console.log "bounds.inViewport = #{@bounds.inViewport.inspect()}"
    console.log "bounds.OnMap = #{@bounds.onMap.inspect()}"

game.Grob = Grob

window.scriptLoaded('app/grob')
