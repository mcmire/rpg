game = window.game

class game.Bounds
  constructor: (@x1=0, @x2=0, @y1=0, @y2=0) ->

  add: (vec) ->
    bounds = @clone()
    if vec.x?
      bounds.x1 += vec.x
      bounds.x2 += vec.x
    if vec.y?
      bounds.y1 += vec.y
      bounds.y2 += vec.y
    bounds

  subtract: (vec) ->
    bounds = @clone()
    if vec.x?
      bounds.x1 -= vec.x
      bounds.x2 -= vec.x
    if vec.y?
      bounds.y1 -= vec.y
      bounds.y2 -= vec.y
    bounds

  # Moves the bounds by the given vector according to the given axis (or axes).
  #
  # Examples:
  #
  #   shift('x', 3)
  #   shift(x: 4, y: 3)
  #
  shift: (args...) ->
    if args.length == 2
      vec = {}
      vec[args[0]] = args[1]
    else
      vec = args[0]

    if vec.x?
      @x1 += vec.x
      @x2 += vec.x
    if vec.y?
      @y1 += vec.y
      @y2 += vec.y

    return this

  # Moves the bounds by a vector such that the given bound corner (so, "x1" or
  # "y2") ends up being the given value. The corresponding bound corner on the
  # other side (so, "x2" if the given bound corner is "x1", or "y1" if given
  # "y2") is moved proportionally.
  #
  # Returns the distance the bounds were moved.
  #
  # Examples:
  #
  #   moveTo('x1', 80)
  #   moveTo('y2', 3)
  #
  moveTo: (key, val) ->
    # picking characters from the string, that's all we're doing
    [axis, side] = key
    [a1, a2] = ["#{axis}1", "#{axis}2"]
    otherSide = if side is "2" then 1 else 2
    otherKey = axis + otherSide
    width = @[a2] - @[a1]
    otherVal = if side is "2" then val - width else val + width

    old = @[a1]

    @[key] = val
    @[otherKey] = otherVal

    distMoved = @[a1] - old
    return distMoved

  clone: ->
    new Bounds(@x1, @x2, @y1, @y2)

  inspect: ->
    "(#{@x1}..#{@x2}, #{@y1}..#{@y2})"
