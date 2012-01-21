
#===============================================================================
# TODO: Can we auto-load this with Ender?
#===============================================================================

# Add class methods to the global ender object
#
$.ender
  # Public: Make modifications to an object by copying properties from other
  # objects, either shallowly or deeply.
  #
  # This is different from the `extend` method that Valentine provides because
  # it supports copying arrays.
  #
  # deep    - If true, then properties are copied deeply, otherwise shallowly.
  #           Copying deeply means that if the value of the property being
  #           copied over is a plain Object or an Array, then we clone it
  #           completely rather than merely bringing over a reference to it.
  #           (Default: true)
  # target  - A plain Object or Array which will receive the modifications.
  # objects - An array of plain Objects or Arrays which will be copied to the
  #           `target`.
  #
  # Returns a modified version of `target`.
  #
  extend: (args...) ->
    if typeof args[0] is 'boolean'
      deep = args.shift()
    else
      deep = true
    target = args.shift()
    objects = args

    for obj in objects
      for own prop of obj
        if deep
          if $.v.is.obj(obj[prop])
            target[prop] = @extend true, {}, obj[prop]
          else if $.v.is.arr(obj[prop])
            target[prop] = @extend true, [], obj[prop]
        else
          target[prop] = obj[prop]

    return target

  # Public: Make a deep copy of the given object.
  #
  # obj - An plain Object or an Array.
  #
  # Returns an Object of the same type as the given Object.
  #
  clone: (obj) ->
    if $.v.is.arr(obj)
      $.extend true, [], obj
    else
      $.extend true, {}, obj

  # Public: Make a shallow copy of the given object.
  #
  # obj - An plain Object or an Array.
  #
  # Returns an Object of the same type as the given Object.
  #
  dup: (obj) ->
    if $.v.is.arr(obj)
      $.extend false, [], obj
    else
      $.extend false, {}, obj

  randomItem: (arr) ->
    arr[this.randomInt(arr.length-1)]

  randomInt: (args...) ->
    if args.length is 1
      [min, max] = [0, args[0]]
    else
      [min, max] = args
    Math.floor(Math.random() * (max - min + 1)) + min

  capitalize: (str) ->
    str[0].toUpperCase() + str[1..-1]

  ensureArray: (arr) ->
    arr = arr[0] if arr.length is 1 and $.is.arr(arr[0])
    return arr

  arrayDelete: (arr, item) ->
    arr.splice(item, 1)

#-------------------------------------------------------------------------------

# Add methods to each ender element
#
enderMembers =
  center: ->
    vp = $.viewport()
    top = (vp.height / 2) - (@height() / 2)
    left = (vp.width / 2) - (@width() / 2)
    @css("top", top + "px").css("left", left + "px")
    return this

  position: ->
    if p = @parent()
      po = p.offset()
      o = @offset()
      {top: o.top - po.top, left: o.left - po.left}
    else
      {top: 0, left: 0}

  parent: ->
    $(this[0].parentNode) if this[0].parentNode

  # Copied from <http://blog.stchur.com/2006/06/21/css-computed-style/>
  computedStyle: (prop) ->
    elem = this[0]
    computedStyle = elem.currentStyle ? document.defaultView.getComputedStyle(elem, null)
    prop and computedStyle[prop] or computedStyle

$.ender(enderMembers, true)
