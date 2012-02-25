game = (window.game ||= {})

meta = game.meta2
{attachable, tickable} = game.roles

viewport = meta.def 'game.viewport',
  attachable,

  # Set the dimensions of the playable area - note that this is the official
  # resolution that Link to the Past ran on (x2 of course).
  # See: <http://strategywiki.org/wiki/The_Legend_of_Zelda:_A_Link_to_the_Past/Version_Differences>
  width:  512  # pixels
  height: 448  # pixels

  init: (@core, @player) ->
    @attachTo(@core)
    @setElement $('<div id="viewport" />').css(width: @width, height: @height)
    @bounds = game.Bounds.rect(0, 0, @width, @height)
    return this

  attach: ->
    @getParentElement().html("")
    @_super()
    @getParentElement().append('<p>Controls: arrow keys (WASD also works too)</p>')

  setMap: (map) ->
    @currentMap = map
    @_setBounds()

  unsetMap: ->
    @currentMap.detach()

  # Public: Move the bounds of the viewport.
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
    @bounds.translate(args...)
    return this

  # Public: Move the X- or Y- bounds of the viewport by specifying the position
  # of one side.
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
    ret = @bounds.translateBySide(side, value)
    return ret

  inspect: ->
    JSON.stringify
      "bounds": @bounds.inspect()

  debug: ->
    console.log "viewport.bounds = #{@bounds.inspect()}"

  # Set the bounds of the viewport on the map itself.
  _setBounds: ->
    p = @core.player
    pb = p.mbounds
    pwh = Math.round(p.width / 2)
    phh = Math.round(p.height / 2)
    vwh  = Math.round(@width / 2)
    vhh  = Math.round(@height / 2)
    # Center the viewport on the player
    # Once we start with the player's coordinates then it makes sense
    x1 = pb.x1 + pwh - vwh
    x1 = 0 if x1 < 0
    y1 = pb.y1 + phh - vhh
    y1 = 0 if y1 < 0
    @bounds.anchor(x1, y1)

game.viewport = viewport

window.scriptLoaded('app/viewport')
