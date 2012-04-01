
# Go ahead and populate $._select. If Bonzo is available then Bonzo is required
# using Ender's require() function and then $._select is set to bonzo.create
# (basically). This happens the first time $._select is called though, not
# before, so by the time it gets called normally, we will have overridden the
# 'require' function, and Bonzo will never get placed as $._select, and
# basically everything will fall apart (for instance $('<div') will completely
# fail).
$._select('<div>')

_boundsFor = (offset) ->
  x1: offset.left
  x2: offset.left + offset.width
  y1: offset.top
  y2: offset.top + offset.height

# Copied from Bounds.intersectWith
_boundsCollide = (b1, b2) ->
  # I intersect you...
  # ...if my x1 is in between your X's
  x1i = (b2.x1 < b1.x1 < b2.x2)
  # ...or my x2 is in between your X's
  x2i = (b2.x1 < b1.x2 < b2.x2)
  # ... or I am covering you, X-wise
  # [ this needs to include == or else it won't work ]
  xo  = (b1.x1 <= b2.x1 and b1.x2 >= b2.x2)
  # ... and ...
  # ... if my y1 is in between your Y's
  y1i = (b2.y1 < b1.y1 < b2.y2)
  # ... or my y2 is in between your Y's
  y2i = (b2.y1 < b1.y2 < b2.y2)
  # ... or I am covering you, Y-wise
  # [ this needs to include == or else it won't work ]
  yo  = (b1.y1 <= b2.y1 and b1.y2 >= b2.y2)
  return (
    (x1i or x2i or xo) and
    (y1i or y2i or yo)
  )

#---

enderStatics =
  includes: (arr, item) ->
    ~arr.indexOf(item)

$.ender(enderStatics)

#---

# Add methods to each ender element
enderMembers =
  collidesWith: ($element) ->
    to = @offset()
    eo = $element.offset()
    _boundsCollide(to, eo)

  removeClassesLike: (regex) ->
    classNames = (this[0].className or "").split(" ")
    classNames = $.v.reject classNames, (name) -> regex.test(name)
    this[0].className = classNames.join(" ")
    return this

  removeAllClasses: -> # ...

  moveBy: (args) ->
    pos = @position()
    x = pos.x + (args.x or 0)
    y = pos.y + (args.y or 0)
    @css('left', "#{x}px")
    @css('top', "#{y}px")

  moveTo: (pos) ->
    @position(pos)

  position: (pos) ->
    if pos
      @css('left', "#{pos.x}px")
      @css('top', "#{pos.y}px")
      return this
    else
      x = parseInt(@css('left'), 10)
      y = parseInt(@css('top'), 10)
      {x, y}

  size: (dim) ->
    if dim
      @css('width', "#{dim.w}px")
      @css('height', "#{dim.h}px")
      return this
    else
      w = parseInt(@css('width'), 10)
      h = parseInt(@css('height'), 10)
      {w, h}

  contains: (elem) ->
    elem = elem[0] if elem instanceof Array
    @each -> return true if this is elem
    return false

  clone: ->
    clone = this[0].cloneNode(true)
    clone.removeAttribute('data-node-uid')
    return $(clone)

$.ender(enderMembers, true)
