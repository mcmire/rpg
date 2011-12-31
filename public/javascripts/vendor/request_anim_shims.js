(function() {
  var fallbackCancelRequestAnimationFrame, fallbackRequestAnimationFrame, nativeCancelRequestAnimationFrame, nativeRequestAnimationFrame;

  nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

  fallbackRequestAnimationFrame = function(callback) {
    return window.setTimeout(callback, 1000 / 60);
  };

  nativeCancelRequestAnimationFrame = window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame;

  fallbackCancelRequestAnimationFrame = window.clearTimeout;

  window.requestAnimFrame = nativeRequestAnimationFrame || fallbackRequestAnimationFrame;

  window.cancelRequestAnimFrame = nativeCancelRequestAnimationFrame || fallbackCancelRequestAnimationFrame;

  window.requestInterval = function(fn, delay) {
    var doLoop, handle, start;
    if (!(nativeRequestAnimationFrame && nativeCancelRequestAnimationFrame)) {
      return setInterval(fn, delay);
    }
    start = new Date().getTime();
    handle = new Object();
    doLoop = function() {
      var current, delta;
      current = new Date().getTime();
      delta = current - start;
      if (delta >= delay) {
        fn();
        start = new Date().getTime();
      }
      return handle.value = requestAnimFrame(doLoop);
    };
    handle.value = requestAnimFrame(doLoop);
    return handle;
  };

  window.clearRequestInterval = function(handle) {
    var fn;
    if (fn = nativeCancelRequestAnimationFrame) {
      return fn(handle.value);
    } else {
      return clearInterval(handle);
    }
  };

  window.requestTimeout = function(fn, delay) {
    var doLoop, handle, start;
    if (!(nativeRequestAnimationFrame && nativeCancelRequestAnimationFrame)) {
      window.setTimeout(fn, delay);
    }
    start = new Date().getTime();
    handle = new Object();
    doLoop = function() {
      var current, delta;
      current = new Date().getTime();
      delta = current - start;
      if (delta >= delay) {
        return fn();
      } else {
        return handle.value = requestAnimFrame(doLoop);
      }
    };
    handle.value = requestAnimFrame(doLoop);
    return handle;
  };

  window.clearRequestTimeout = function(handle) {
    var fn;
    if (fn = nativeCancelRequestAnimationFrame) {
      return fn(handle.value);
    } else {
      return clearTimeout(handle);
    }
  };

}).call(this);
