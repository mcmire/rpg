game = (window.game ||= {})

meta = game.meta2
{attachable, tickable} = game.roles
Bounds = game.Bounds
canvas = game.canvas

viewport = meta.def 'game.viewport',
  attachable,
  tickable,

  # Set the dimensions of the playable area - note that this is the official
  # resolution that Link to the Past ran on (x2 of course).
  # See: <http://strategywiki.org/wiki/The_Legend_of_Zelda:_A_Link_to_the_Past/Version_Differences>
  width:  512  # pixels
  height: 448  # pixels

  init: (@core) ->
    @_super(@core)  # attachable

  setElement: ->
    @$element = $('<div id="viewport" />').css
      width: @width
      height: @height
      'background-repeat': 'no-repeat'

  attach: ->
    @_super()

  tick: ->
    @draw()

  draw: ->
    bom = @bounds
    positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ")
    @$element.css('background-position', positionStr)

  setMap: (map) ->
    @currentMap = map
    @$element.css('background-image', map.background.getDataURL())
    @$element.html(map.foreground.canvas)
    @_setBounds()

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
  #   translateBounds('x', 20)
  #   translateBounds(x: 2, y: -9)
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
    @bounds.translateBySide(side, value)

  inspect: ->
    JSON.stringify
      "bounds": @bounds.inspect()

  debug: ->
    console.log "viewport.bounds = #{@bounds.inspect()}"

  _setBounds: ->
    # These are the bounds of the viewport on the map itself
    # TODO: Start bounds centered on player
    @bounds = Bounds.rect(0, 0, @width, @height)

game.viewport = viewport

window.scriptLoaded('app/viewport')
