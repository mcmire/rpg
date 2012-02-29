
# Go ahead and populate $._select. If Bonzo is available then Bonzo is required
# using Ender's require() function and then $._select is set to bonzo.create
# (basically). This happens the first time $._select is called though, not
# before, so by the time it gets called normally, we will have overridden the
# 'require' function, and Bonzo will never get placed as $._select, and
# basically everything will fall apart (for instance $('<div') will completely
# fail).
$._select('<div>')

# Add methods to each ender element
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
