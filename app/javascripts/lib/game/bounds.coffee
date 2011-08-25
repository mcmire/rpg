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

  # shift(axis, value)
  # shift(vector)
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

  # This method is really hard to explain, so I'll give an example and
  # you should be able to figure it out pretty quickly. Say that we have bounds
  # {x1: 10, x2: 20, y1: 100, y2: 200}. Now let's say we want to shift
  # both X-values of these bounds by a number so that the x2 value ends up
  # being 80. That is exactly what this does:
  #
  #   set('x2', 80)
  #
  # Returns the distance the bounds were moved as x/y coordinates.
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

    diff = @[a1] - old
    #ret = {}
    #ret[axis] = diff
    #ret
    diff

  clone: ->
    new Bounds(@x1, @x2, @y1, @y2)

  inspect: ->
    "(#{@x1}..#{@x2}, #{@y1}..#{@y2})"
