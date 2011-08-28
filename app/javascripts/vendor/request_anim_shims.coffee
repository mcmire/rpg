
##
# requestAnimationFrame shims adapted from code by Paul Irish [1] and Joe
# Lambert [2]. Also see [3] for an example of how to use this.
#
# [1]: http://paulirish.com/2011/requestanimationframe-for-smart-animating
# [2]: http://blog.joelambert.co.uk/2011/06/01/a-better-settimeoutsetinterval/
# [3]: http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop
##

nativeRequestAnimationFrame =
  window.requestAnimationFrame or
  window.webkitRequestAnimationFrame or
  window.mozRequestAnimationFrame or
  window.oRequestAnimationFrame or
  window.msRequestAnimationFrame

fallbackRequestAnimationFrame = (callback) ->
  # cap at 60 fps
  window.setTimeout(callback, 1000 / 60)

nativeCancelRequestAnimationFrame =
  window.cancelAnimationFrame or
  window.webkitCancelRequestAnimationFrame or
  window.mozCancelRequestAnimationFrame or
  window.oCancelRequestAnimationFrame or
  window.msCancelRequestAnimationFrame

fallbackCancelRequestAnimationFrame = window.clearTimeout

# requestAnimationFrame() shim by Paul Irish
#
# Accepts a callback which requestAnimationFrame will call with the current
# time, as well as an element which contains the animation. For canvas and
# WebGL, this will be the actual <canvas> element. For DOM stuff, you can leave
# it off or define it for a slightly more optimized experience.
#
window.requestAnimFrame =
  nativeRequestAnimationFrame or
  fallbackRequestAnimationFrame

window.cancelRequestAnimFrame =
  nativeCancelRequestAnimationFrame or
  fallbackCancelRequestAnimationFrame

# Shim that behaves the same as setInterval except uses requestAnimationFrame()
# where possible for better performance.
#
# @param {function} fn The callback function
# @param {int} delay The delay in milliseconds
#
window.requestInterval = (fn, delay) ->
  # Note that Firefox 5 has mozRequestAnimationFrame but not
  # mozCancelRequestAnimationFrame so we must check for that too.
  #
  unless nativeRequestAnimationFrame and nativeCancelRequestAnimationFrame
    return setInterval(fn, delay)

  start = new Date().getTime()
  handle = new Object()

  # loop idly until the requested amount of time has passed,
  # then call the given callback and start over
  doLoop = ->
    current = new Date().getTime()
    delta = current - start
    if delta >= delay
      fn()
      start = new Date().getTime()
    handle.value = requestAnimFrame(doLoop)
  handle.value = requestAnimFrame(doLoop)

  return handle

# Shim that behaves the same as clearInterval except uses
# cancelRequestAnimationFrame() where possible for better performance.
#
# @param {int|object} handle
#   A value returned from either requestAnimationFrame(), or setInterval()
#
window.clearRequestInterval = (handle) ->
  if fn = nativeCancelRequestAnimationFrame
    fn(handle.value)
  else
    clearInterval(handle)

# Shim that behaves the same as setTimeout except uses requestAnimationFrame()
# where possible for better performance
#
# @param {function} fn The callback function
# @param {int} delay The delay in milliseconds
#
window.requestTimeout = (fn, delay) ->
  # Note that Firefox 5 has mozRequestAnimationFrame but not
  # mozCancelRequestAnimationFrame so we must check for that too.
  #
  unless nativeRequestAnimationFrame and nativeCancelRequestAnimationFrame
    window.setTimeout(fn, delay)

  start = new Date().getTime()
  handle = new Object()

  # loop idly until the requested amount of time has passed,
  # then call the given callback and stop
  doLoop = ->
    current = new Date().getTime()
    delta = current - start
    if delta >= delay
      fn()
    else
      handle.value = requestAnimFrame(doLoop)
  handle.value = requestAnimFrame(doLoop)

  return handle

# Shim that behaves the same as clearInterval except uses
# cancelRequestAnimationFrame() where possible for better performance
#
# @param {int|object} handle
#   A value returned from either requestAnimationFrame(), or setTimeout()
#
window.clearRequestTimeout = (handle) ->
  if fn = nativeCancelRequestAnimationFrame
    fn(handle.value)
  else
    clearTimeout(handle)
