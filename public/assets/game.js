/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build domready qwery bean bonzo valentine
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);

!function () {

  var module = { exports: {} }, exports = module.exports;

  !function (name, definition) {
    if (typeof define == 'function') define(definition)
    else if (typeof module != 'undefined') module.exports = definition()
    else this[name] = this['domReady'] = definition()
  }('domready', function (ready) {

    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , loaded = /^loade|c/.test(doc.readyState)

    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }

    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)


    hack && doc.attachEvent(onreadystatechange, (fn = function () {
      if (/^c/.test(doc.readyState)) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    }))

    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2011
    * MIT License
    */

  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('qwery', function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'

      // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([\s\w\+\-]+)['"]?\))?/
        // check if we can pass a selector to a non-CSS3 compatible qSA.
        // *not* suitable for validating a selector, it's too lose; it's the users' responsibility to pass valid selectors
        // this regex must be kept in sync with the one in tests.js
      , css2 = /^(([\w\-]*[#\.]?[\w\-]+|\*)?(\[[\w\-]+([\~\|]?=['"][ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+["'])?\])?(\:(link|visited|active|hover))?([\s>+~\.,]|(?:$)))+$/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }

    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }

    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()

    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }

    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn.call(null, a[i])
    }

    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }

    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }

    function previous(n) {
      while (n = n.previousSibling) if (n.nodeType == 1) break;
      return n
    }

    function q(query) {
      return query.match(chunker)
    }

    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this.nodeType !== 1) return false
      if (tag && tag !== '*' && this.tagName && this.tagName.toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) {
          if (!classRegex(classes[i].slice(1)).test(this.className)) return false
        }
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) {
        return false
      }
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }

    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }

    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }

    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)

      if (!tokens.length) return r

      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r

      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root.nodeType !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root.nodeType == 1 && (intr[1] ? intr[1] == root.tagName.toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r

      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }

    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }

    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }

    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9)
    }

    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }

    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }

    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root.nodeType && arrayLike(root)) return root[0]
      return root
    }

    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root.nodeType === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }

    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)

      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (supportsCSS3 && m[3]) return arrayify(root[byClass](m[3]))
      }

      return select(selector, root)
    }

    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root.nodeType !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }

    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container.nodeType === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
      // does native qSA support CSS3 level selectors
    , supportsCSS3 = function () {
        if (doc[byClass] && doc.querySelector && doc[qSA]) {
          try {
            var p = doc.createElement('p')
            p.innerHTML = '<a/>'
            return p[qSA](':nth-of-type(1)').length
          } catch (e) { }
        }
        return false
      }()
      // native support for CSS3 selectors
    , selectCSS3 = function (selector, root) {
        var result = [], ss, e
        try {
          if (root.nodeType === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // native support for CSS2 selectors only
    , selectCSS2qSA = function (selector, root) {
        var i, r, l, ss, result = []
        selector = selector.replace(normalizr, '$1')
        // safe to pass whole selector to qSA
        if (!splittable.test(selector) && css2.test(selector)) return arrayify(root[qSA](selector))
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          // use native qSA if selector is compatile, otherwise use _qwery()
          r = css2.test(s) ? ctx[qSA](s) : _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx.nodeType === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx.nodeType === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , select = function () {
        var q = qwery.nonStandardEngine ? selectNonNative : supportsCSS3 ? selectCSS3 : doc[qSA] ? selectCSS2qSA : selectNonNative
        return q.apply(q, arguments)
      }

    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}
    qwery.nonStandardEngine = false

    return qwery
  })


  provide("qwery", module.exports);

  !function (doc, $) {
    var q = require('qwery')

    $.pseudos = q.pseudos

    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function(b) {
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }

    $.ender({
      find: function (s) {
        var r = [], i, l, j, k, els
        for (i = 0, l = this.length; i < l; i++) {
          els = q(s, this[i])
          for (j = 0, k = els.length; j < k; j++) r.push(els[j])
        }
        return $(q.uniq(r))
      }
      , and: function (s) {
        var plus = $(s)
        for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
          this[i] = plus[j]
        }
        return this
      }
      , is: function(s, r) {
        var i, l
        for (i = 0, l = this.length; i < l; i++) {
          if (q.is(this[i], s, r)) {
            return true
          }
        }
        return false
      }
    }, true)
  }(document, ender);


}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = { one: 1 } // singleton for quick matching making add() do one()

      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        })({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded readystatechange ' + // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'message readystatechange pageshow pagehide popstate ' +           // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        )

      , customEvents = (function () {
          function isDescendant(parent, node) {
            while ((node = node.parentNode) !== null) {
              if (node === parent) return true
            }
            return false
          }

          function check(event) {
            var related = event.relatedTarget
            if (!related) return related === null
            return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related))
          }

          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        })()

      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }

          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result

            var props
              , type = event.type
              , target = event.target || event.srcElement

            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result.target = target && target.nodeType === 3 ? target.parentNode : target

            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.which || event.keyCode
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        })()

        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }

        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.isNative = nativeEvents[type] && element[eventSupport]
            this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !this.isNative && type
            this.target = targetElement(element, this.isNative)
            this.eventSupport = this.target[eventSupport]
          }

          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }

              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }

          return entry
        })()

      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}

            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }

            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }

            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }

            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }

            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }

              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }

          return { has: has, get: get, put: put, del: del, entries: entries }
        })()

        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }

      , nativeHandler = function (element, fn, args) {
          return function (event) {
            event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true)
            return fn.apply(element, [event].concat(args))
          }
        }

      , customHandler = function (element, fn, type, condition, args, isNative) {
          return function (event) {
            if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event)
                event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative)
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
        }

      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }

      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)

          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i]).eventSupport)
                listener(entry.target, entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }

      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')

          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry.eventSupport)
            listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
        }

      , del = function (selector, fn, $) {
          return function (e) {
            var target, i, array = typeof selector === 'string' ? $(selector, this) : selector
            for (target = e.target; target && target !== this; target = target.parentNode) {
              for (i = array.length; i--;) {
                if (array[i] === target) {
                  return fn.apply(target, arguments)
                }
              }
            }
          }
        }

      , remove = function (element, typeSpec, fn) {
          var k, m, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'

          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }

      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'

          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }

      , one = function () {
          return add.apply(ONE, arguments)
        }

      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }

      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')

          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }

      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length

          for (;i < l; i++)
            handlers[i].original && add(element, handlers[i].type, handlers[i].original)
          return element
        }

      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , noConflict: function () {
              context[name] = old
              return this
            }
        }

    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }

    return bean
  })


  provide("bean", module.exports);

  !function ($) {
    var b = require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var args, i = 0, l = this.length; i < l; i++) {
              args = [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0))
              args.length == 4 && args.push($)
              !arguments.length && method == 'add' && type && (method = 'fire')
              b[method].apply(this, args)
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')

      , methods = {
            on: add
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add

          , one: integrate('one')

          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove

          , emit: fire
          , trigger: fire

          , cloneEvents: integrate('clone')

          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }

      , shortcuts = [
            'blur', 'change', 'click', 'dblclick', 'error', 'focus', 'focusin'
          , 'focusout', 'keydown', 'keypress', 'keyup', 'load', 'mousedown'
          , 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'mouseup', 'mousemove'
          , 'resize', 'scroll', 'select', 'submit', 'unload'
        ]

    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }

    $.ender(methods, true)
  }(ender)


}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2011
    * https://github.com/ded/bonzo
    * License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
  }('bonzo', function() {
    var context = this
      , win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null
      , specialAttributes = /^checked|value|selected$/
      , specialTags = /select|fieldset|table|tbody|tfoot|td|tr|colgroup/i
      , table = [ '<table>', '</table>', 1 ]
      , td = [ '<table><tbody><tr>', '</tr></tbody></table>', 3 ]
      , option = [ '<select>', '</select>', 1 ]
      , tagMap = {
          thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: [ '<table><tbody>', '</tbody></table>', 2 ]
          , th: td , td: td
          , col: [ '<table><colgroup>', '</colgroup></table>', 2 ]
          , fieldset: [ '<form>', '</form>', 1 ]
          , legend: [ '<form><fieldset>', '</fieldset></form>', 2 ]
          , option: option
          , optgroup: option }
      , stateAttributes = /^checked|selected$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }

    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }

    function each(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) fn.call(scope || ar[i], ar[i], i, ar)
      return ar
    }

    function deepEach(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, scope)
          fn.call(scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }

    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }

    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }

    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }

    function clearData(el) {
      uid = el[getAttribute]('data-node-uid')
      uid && (delete uidMap[uid])
    }

    function dataValue(d) {
      try {
        return d === 'true' ? true : d === 'false' ? false : d === 'null' ? null : !isNaN(d) ? parseFloat(d) : d;
      } catch(e) {}
      return undefined
    }

    function isNode(node) {
      return node && node.nodeName && node.nodeType == 1
    }

    function some(ar, fn, scope, i) {
      for (i = 0, j = ar.length; i < j; ++i) if (fn.call(scope, ar[i], i, ar)) return true
      return false
    }

    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }

    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :

      (ie && html.currentStyle) ?

      function (el, property) {
        if (property == 'opacity') {
          var val = 100
          try {
            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el.filters('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :

      function (el, property) {
        return el.style[property]
      }

    // this insert method is intense
    function insert(target, host, fn) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t) {
        each(self, function (el) {
          var n = !el[parentNode] || (el[parentNode] && !el[parentNode][parentNode]) ?
            function () {
              var c = el.cloneNode(true)
              // check for existence of an event cloner
              // preferably https://github.com/fat/bean
              // otherwise Bonzo won't do this for you
              self.$ && self.cloneEvents && self.$(c).cloneEvents(el)
              return c
            }() : el
          fn(t, n)
          r[i] = n
          i++
        })
      }, this)
      each(r, function (e, i) {
        self[i] = e
      })
      self.length = i
      return self
    }

    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]

      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }

      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)

      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)

    }

    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once,
    // so we have to iterate. bullshit
    if (features.classList) {
      hasClass = function (el, c) {
        return some(c.toString().split(' '), function (c) {
          return el.classList.contains(c)
        })
      }
      addClass = function (el, c) {
        each(c.toString().split(' '), function (c) {
          el.classList.add(c)
        })
      }
      removeClass = function (el, c) { el.classList.remove(c) }
    }
    else {
      hasClass = function (el, c) { return classReg(c).test(el.className) }
      addClass = function (el, c) { el.className = trim(el.className + ' ' + c) }
      removeClass = function (el, c) { el.className = trim(el.className.replace(classReg(c), ' ')) }
    }


    // this allows method calling for setting values
    // example:
    // bonzo(elements).css('color', function (el) {
    //   return el.getAttribute('data-original-color')
    // })
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }

    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) {
          this[i] = elements[i]
        }
      }
    }

    Bonzo.prototype = {

        // indexr method, because jQueriers want this method
        get: function (index) {
          return this[index] || null
        }

        // itetators
      , each: function (fn, scope) {
          return each(this, fn, scope)
        }

      , deepEach: function (fn, scope) {
          return deepEach(this, fn, scope)
        }

      , map: function (fn, reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            reject ? (reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }

      // text and html inserters!
      , html: function (h, text) {
          var method = text ?
            html.textContent === undefined ?
              'innerText' :
              'textContent' :
            'innerHTML', m;
          function append(el) {
            each(normalize(h), function (node) {
              el.appendChild(node)
            })
          }
          return typeof h !== 'undefined' ?
              this.empty().each(function (el) {
                !text && (m = el.tagName.match(specialTags)) ?
                  append(el, m[0]) :
                  !function() {
                    try { (el[method] = h) }
                    catch(e) { append(el) }
                  }();
              }) :
            this[0] ? this[0][method] : ''
        }

      , text: function (text) {
          return this.html(text, 1)
        }

        // more related insertion methods
      , append: function (node) {
          return this.each(function (el) {
            each(normalize(node), function (i) {
              el.appendChild(i)
            })
          })
        }

      , prepend: function (node) {
          return this.each(function (el) {
            var first = el.firstChild
            each(normalize(node), function (i) {
              el.insertBefore(i, first)
            })
          })
        }

      , appendTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.appendChild(el)
          })
        }

      , prependTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          })
        }

      , before: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }

      , after: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            })
          })
        }

      , insertBefore: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }

      , insertAfter: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            var sibling = t.nextSibling
            if (sibling) {
              t[parentNode].insertBefore(el, sibling);
            }
            else {
              t[parentNode].appendChild(el)
            }
          })
        }

      , replaceWith: function(html) {
          this.deepEach(clearData)

          return this.each(function (el) {
            el.parentNode.replaceChild(bonzo.create(html)[0], el)
          })
        }

        // class management
      , addClass: function (c) {
          return this.each(function (el) {
            hasClass(el, setter(el, c)) || addClass(el, setter(el, c))
          })
        }

      , removeClass: function (c) {
          return this.each(function (el) {
            hasClass(el, setter(el, c)) && removeClass(el, setter(el, c))
          })
        }

      , hasClass: function (c) {
          return some(this, function (el) {
            return hasClass(el, c)
          })
        }

      , toggleClass: function (c, condition) {
          return this.each(function (el) {
            typeof condition !== 'undefined' ?
              condition ? addClass(el, c) : removeClass(el, c) :
              hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
          })
        }

        // display togglers
      , show: function (type) {
          return this.each(function (el) {
            el.style.display = type || ''
          })
        }

      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }

      , toggle: function (callback, type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : type || ''
          })
          callback && callback()
          return this
        }

        // DOM Walkers & getters
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }

      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }

      , next: function () {
          return this.related('nextSibling')
        }

      , previous: function () {
          return this.related('previousSibling')
        }

      , parent: function() {
        return this.related('parentNode')
      }

      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }

        // meh. use with care. the ones in Bean are better
      , focus: function () {
          return this.length > 0 ? this[0].focus() : null
        }

      , blur: function () {
          return this.each(function (el) {
            el.blur()
          })
        }

        // style getter setter & related methods
      , css: function (o, v, p) {
          // is this a request for just getting a style?
          if (v === undefined && typeof o == 'string') {
            // repurpose 'v'
            v = this[0]
            if (!v) {
              return null
            }
            if (v === doc || v === win) {
              p = (v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(v, o) : null
          }
          var iter = o
          if (typeof o == 'string') {
            iter = {}
            iter[o] = v
          }

          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }

          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }

      , offset: function (x, y) {
          if (typeof x == 'number' || typeof y == 'number') {
            return this.each(function (el) {
              xy(el, x, y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
          }

          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }

      , dim: function () {
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t, s) {
                  s = {
                      position: el.style.position || ''
                    , visibility: el.style.visibility || ''
                    , display: el.style.display || ''
                  }
                  t.first().css({
                      position: 'absolute'
                    , visibility: 'hidden'
                    , display: 'block'
                  })
                  return s
                }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight

          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }

        // attributes are hard. go shopping
      , attr: function (k, v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof v == 'undefined' ?
            specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, v)) : el[setAttribute](k, setter(el, v))
            })
        }

      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }

      , val: function (s) {
          return (typeof s == 'string') ? this.attr('value', s) : this[0].value
        }

        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
      , data: function (k, v) {
          var el = this[0], uid, o, m
          if (typeof v === 'undefined') {
            o = data(el)
            if (typeof k === 'undefined') {
              each(el.attributes, function(a) {
                (m = (''+a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              return typeof o[k] === 'undefined' ?
                (o[k] = dataValue(this.attr('data-' + decamelize(k)))) : o[k]
            }
          } else {
            return this.each(function (el) { data(el)[k] = v })
          }
        }

        // DOM detachment & related
      , remove: function () {
          this.deepEach(clearData)

          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }

      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)

            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }

      , detach: function () {
          return this.map(function (el) {
            return el[parentNode].removeChild(el)
          })
        }

        // who uses a mouse anyway? oh right.
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }

      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }

    }

    function normalize(node) {
      return typeof node == 'string' ? bonzo.create(node) : isNode(node) ? [node] : node // assume [nodes]
    }

    function scroll(x, y, type) {
      var el = this[0]
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }

    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }

    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }

    function bonzo(els, host) {
      return new Bonzo(els, host)
    }

    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }

    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }

    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)

          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els

        }() : isNode(node) ? [node.cloneNode(true)] : []
    }

    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }

    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }

    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }

    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }

    return bonzo
  })


  provide("bonzo", module.exports);

  !function ($) {

    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })

    $.id = function (id) {
      return $([document.getElementById(id)])
    }

    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }

    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }

    $.ender({
      parents: function (selector, closest) {
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }

    , parent: function() {
        return $(uniq(b(this).parent()))
      }

    , closest: function (selector) {
        return this.parents(selector, true)
      }

    , first: function () {
        return $(this.length ? this[0] : this)
      }

    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }

    , next: function () {
        return $(b(this).next())
      }

    , previous: function () {
        return $(b(this).previous())
      }

    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }

    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }

    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }

    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }

    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }

    , children: function () {
        var i, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }

    , height: function (v) {
        return dimension(v, this, 'height')
      }

    , width: function (v) {
        return dimension(v, this, 'width')
      }
    }, true)

    function dimension(v, self, which) {
      return v ?
        self.css(which, v) :
        function (r) {
          if (!self[0]) return 0
          r = parseInt(self.css(which), 10);
          return isNaN(r) ? self[0]['offset' + which.replace(/^\w/, function (m) {return m.toUpperCase()})] : r
        }()
    }

  }(ender);


}();

!function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Valentine: JavaScript's functional Sister
    * (c) Dustin Diaz 2011
    * https://github.com/ded/valentine
    * License MIT
    */

  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function') define(definition)
    else this[name] = this['v'] = definition()
  }('valentine', function () {

    var context = this
      , old = context.v
      , ap = []
      , op = {}
      , n = null
      , slice = ap.slice
      , nativ = 'map' in ap
      , nativ18 = 'reduce' in ap
      , trimReplace = /(^\s*|\s*$)/g
      , iters = {
      each: nativ ?
        function (a, fn, scope) {
          ap.forEach.call(a, fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            i in a && fn.call(scope, a[i], i, a)
          }
        }

    , map: nativ ?
        function (a, fn, scope) {
          return ap.map.call(a, fn, scope)
        } :
        function (a, fn, scope) {
          var r = [], i
          for (i = 0, l = a.length; i < l; i++) {
            i in a && (r[i] = fn.call(scope, a[i], i, a))
          }
          return r
        }

    , some: nativ ?
        function (a, fn, scope) {
          return a.some(fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            if (i in a && fn.call(scope, a[i], i, a)) return true
          }
          return false
        }

    , every: nativ ?
        function (a, fn, scope) {
          return a.every(fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            if (i in a && !fn.call(scope, a[i], i, a)) return false
          }
          return true
        }

    , filter: nativ ?
        function (a, fn, scope) {
          return a.filter(fn, scope)
        } :
        function (a, fn, scope) {
          for (var r = [], i = 0, j = 0, l = a.length; i < l; i++) {
            if (i in a) {
              if (!fn.call(scope, a[i], i, a)) continue;
              r[j++] = a[i]
            }
          }
          return r
        }

    , indexOf: nativ ?
        function (a, el, start) {
          return a.indexOf(el, isFinite(start) ? start : 0)
        } :
        function (a, el, start) {
          start = start || 0
          for (var i = 0; i < a.length; i++) {
            if (i in a && a[i] === el) return i
          }
          return -1
        }

    , lastIndexOf: nativ ?
        function (a, el, start) {
          return a.lastIndexOf(el, isFinite(start) ? start : a.length)
        } :
        function (a, el, start) {
          start = start || a.length
          start = start >= a.length ? a.length :
            start < 0 ? a.length + start : start
          for (var i = start; i >= 0; --i) {
            if (i in a && a[i] === el) {
              return i
            }
          }
          return -1
        }

    , reduce: nativ18 ?
        function (o, i, m, c) {
          return ap.reduce.call(o, i, m, c);
        } :
        function (obj, iterator, memo, context) {
          if (!obj) obj = []
          var i = 0, l = obj.length
          if (arguments.length < 3) {
            do {
              if (i in obj) {
                memo = obj[i++]
                break;
              }
              if (++i >= l) {
                throw new TypeError('Empty array')
              }
            } while (1)
          }
          for (; i < l; i++) {
            if (i in obj) {
              memo = iterator.call(context, memo, obj[i], i, obj)
            }
          }
          return memo
        }

    , reduceRight: nativ18 ?
        function (o, i, m, c) {
          return ap.reduceRight.call(o, i, m, c)
        } :
        function (obj, iterator, memo, context) {
          !obj && (obj = [])
          var l = obj.length, i = l - 1
          if (arguments.length < 3) {
            do {
              if (i in obj) {
                memo = obj[i--]
                break;
              }
              if (--i < 0) {
                throw new TypeError('Empty array')
              }
            } while (1)
          }
          for (; i >= 0; i--) {
            if (i in obj) {
              memo = iterator.call(context, memo, obj[i], i, obj)
            }
          }
          return memo
        }

    , find: function (obj, iterator, context) {
        var result
        iters.some(obj, function (value, index, list) {
          if (iterator.call(context, value, index, list)) {
            result = value
            return true
          }
        })
        return result
      }

    , reject: function (a, fn, scope) {
        var r = []
        for (var i = 0, j = 0, l = a.length; i < l; i++) {
          if (i in a) {
            if (fn.call(scope, a[i], i, a)) {
              continue;
            }
            r[j++] = a[i]
          }
        }
        return r
      }

    , size: function (a) {
        return o.toArray(a).length
      }

    , compact: function (a) {
        return iters.filter(a, function (value) {
          return !!value
        })
      }

    , flatten: function (a) {
        return iters.reduce(a, function (memo, value) {
          if (is.arr(value)) {
            return memo.concat(iters.flatten(value))
          }
          memo[memo.length] = value
          return memo
        }, [])
      }

    , uniq: function (ar) {
        var a = [], i, j
        label:
        for (i = 0; i < ar.length; i++) {
          for (j = 0; j < a.length; j++) {
            if (a[j] == ar[i]) {
              continue label
            }
          }
          a[a.length] = ar[i]
        }
        return a
      }

    , merge: function (one, two) {
        var i = one.length, j = 0, l
        if (isFinite(two.length)) {
          for (l = two.length; j < l; j++) {
            one[i++] = two[j]
          }
        } else {
          while (two[j] !== undefined) {
            first[i++] = second[j++]
          }
        }
        one.length = i
        return one
      }

    , inArray: function (ar, needle) {
        return !!~iters.indexOf(ar, needle)
      }

    }

    var is = {
      fun: function (f) {
        return typeof f === 'function'
      }

    , str: function (s) {
        return typeof s === 'string'
      }

    , ele: function (el) {
        !!(el && el.nodeType && el.nodeType == 1)
      }

    , arr: function (ar) {
        return ar instanceof Array
      }

    , arrLike: function (ar) {
        return (ar && ar.length && isFinite(ar.length))
      }

    , num: function (n) {
        return typeof n === 'number'
      }

    , bool: function (b) {
        return (b === true) || (b === false)
      }

    , args: function (a) {
        return !!(a && op.hasOwnProperty.call(a, 'callee'))
      }

    , emp: function (o) {
        var i = 0
        return is.arr(o) ? o.length === 0 :
          is.obj(o) ? (function () {
            for (var k in o) {
              i++
              break;
            }
            return (i === 0)
          }()) :
          o === ''
      }

    , dat: function (d) {
        return !!(d && d.getTimezoneOffset && d.setUTCFullYear)
      }

    , reg: function (r) {
        return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false))
      }

    , nan: function (n) {
        return n !== n
      }

    , nil: function (o) {
        return o === n
      }

    , und: function (o) {
        return typeof o === 'undefined'
      }

    , def: function (o) {
        return typeof o !== 'undefined'
      }

    , obj: function (o) {
        return o instanceof Object && !is.fun(o) && !is.arr(o)
      }
    }

    var o = {
      each: function (a, fn, scope) {
        is.arrLike(a) ?
          iters.each(a, fn, scope) : (function () {
            for (var k in a) {
              op.hasOwnProperty.call(a, k) && fn.call(scope, k, a[k], a)
            }
          }())
      }

    , map: function (a, fn, scope) {
        var r = [], i = 0
        return is.arrLike(a) ?
          iters.map(a, fn, scope) : !function () {
            for (var k in a) {
              op.hasOwnProperty.call(a, k) && (r[i++] = fn.call(scope, k, a[k], a))
            }
          }() && r
      }

    , pluck: function (a, k) {
        return is.arrLike(a) ?
          iters.map(a, function (el) {
            return el[k]
          }) :
          o.map(a, function (_, v) {
            return v[k]
          })
      }

    , toArray: function (a) {
        if (!a) return []

        if (is.arr(a)) return a

        if (a.toArray) return a.toArray()

        if (is.args(a)) return slice.call(a)

        return iters.map(a, function (k) {
          return k
        })
      }

    , first: function (a) {
        return a[0]
      }

    , last: function (a) {
        return a[a.length - 1]
      }

    , keys: Object.keys ?
        function (o) {
          return Object.keys(o)
        } :
        function (obj) {
          var keys = [], key
          for (key in obj) if (op.hasOwnProperty.call(obj, key)) keys[keys.length] = key
          return keys
        }

    , values: function (ob) {
        return o.map(ob, function (k, v) {
          return v
        })
      }

    , extend: function () {
        // based on jQuery deep merge
        var options, name, src, copy, clone
          , target = arguments[0], i = 1, length = arguments.length

        for (; i < length; i++) {
          if ((options = arguments[i]) !== n) {
            // Extend the base object
            for (name in options) {
              src = target[name]
              copy = options[name]
              if (target === copy) {
                continue;
              }
              if (copy && (is.obj(copy))) {
                clone = src && is.obj(src) ? src : {}
                target[name] = o.extend(clone, copy);
              } else if (copy !== undefined) {
                target[name] = copy
              }
            }
          }
        }
        return target
      }

    , trim: String.prototype.trim ?
        function (s) {
          return s.trim()
        } :
        function (s) {
          return s.replace(trimReplace, '')
        }

    , bind: function (scope, fn) {
        return function () {
          fn.apply(scope, arguments)
        }
      }

    , parallel: function (fns, callback) {
        var args = o.toArray(arguments)
          , len = 0
          , returns = []
          , flattened = []

        if (!is.arr(fns)) {
          callback = args.pop()
          fns = args
        }

        iters.each(fns, function (el, i) {
          el(function () {
            var a = o.toArray(arguments)
              , e = a.shift()
            if (e) return callback(e)
            returns[i] = a
            if (fns.length == ++len) {
              returns.unshift(n)

              iters.each(returns, function (r) {
                flattened = flattened.concat(r)
              })

              callback.apply(n, flattened)
            }
          })
        })
      }

    , waterfall: function (fns, callback) {
        var args = o.toArray(arguments)
          , index = 0
        if (!is.arr(fns)) {
          callback = args.pop()
          fns = args
        }
        (function f() {
          var args = o.toArray(arguments)
          args.push(f)
          var err = args.shift()
          if (!err && fns.length) fns.shift().apply(n, args)
          else {
            args.pop()
            args.unshift(err)
            callback.apply(n, args)
          }
        }(n))
      }
    , queue: function (ar) {
        return new Queue(is.arrLike(ar) ? ar : o.toArray(arguments))
      }
    }

    function Queue (a) {
      this.values = a
      this.index = 0
    }

    Queue.prototype.next = function () {
      this.index < this.values.length && this.values[this.index++]()
      return this
    }

    function v(a, scope) {
      return new Valentine(a, scope)
    }

    function aug(o, o2) {
      for (var k in o2) o[k] = o2[k]
    }

    aug(v, iters)
    aug(v, o)
    v.is = is

    v.v = v // vainglory

    // peoples like the object style
    function Valentine(a, scope) {
      this.val = a
      this._scope = scope || n
      this._chained = 0
    }

    v.each(v.extend({}, iters, o), function (name, fn) {
      Valentine.prototype[name] = function () {
        var a = v.toArray(arguments)
        a.unshift(this.val)
        var ret = fn.apply(this._scope, a)
        this.val = ret
        return this._chained ? this : ret
      }
    })

    // people like chaining
    aug(Valentine.prototype, {
      chain: function () {
        this._chained = 1
        return this
      }
    , value: function () {
        return this.val
      }
    })


    v.noConflict = function () {
      context.v = old
      return this
    }

    return v
  })

  provide("valentine", module.exports);

  var v = require('valentine')
  ender.ender(v)
  ender.ender({
      merge: v.merge
    , extend: v.extend
    , each: v.each
    , map: v.map
    , toArray: v.toArray
    , keys: v.keys
    , values: v.values
    , trim: v.trim
    , bind: v.bind
    , parallel: v.parallel
    , waterfall: v.waterfall
    , inArray: v.inArray
    , queue: v.queue
  })

}();

(function() {

  (function() {
    var enderMembers;
    enderMembers = {
      center: function() {
        var left, top, vp;
        vp = $.viewport();
        top = (vp.height / 2) - (this.height() / 2);
        left = (vp.width / 2) - (this.width() / 2);
        this.css("top", top + "px").css("left", left + "px");
        return this;
      },
      position: function() {
        var o, p, po;
        if (p = this.parent()) {
          po = p.offset();
          o = this.offset();
          return {
            top: o.top - po.top,
            left: o.left - po.left
          };
        } else {
          return {
            top: 0,
            left: 0
          };
        }
      },
      parent: function() {
        if (this[0].parentNode) return $(this[0].parentNode);
      },
      computedStyle: function(prop) {
        var computedStyle, elem, _ref;
        elem = this[0];
        computedStyle = (_ref = elem.currentStyle) != null ? _ref : document.defaultView.getComputedStyle(elem, null);
        return prop && computedStyle[prop] || computedStyle;
      }
    };
    return $.ender(enderMembers, true);
  })();

  window.scriptLoaded('app/ender_ext');

}).call(this);

(function() {

  Array.prototype["delete"] = function(value) {
    return this.deleteAt(this.indexOf(value));
  };

  Array.prototype.deleteAt = function(index) {
    return this.splice(index, 1);
  };

  window.scriptLoaded('app/ext');

}).call(this);

(function() {
  var game, util,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  game = (window.game || (window.game = {}));

  util = {
    extend: function() {
      var args, deep, obj, objects, prop, target, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === 'boolean') {
        deep = args.shift();
      } else {
        deep = false;
      }
      target = args.shift();
      objects = args;
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        for (prop in obj) {
          if (!__hasProp.call(obj, prop)) continue;
          if (deep && ($.v.is.obj(obj[prop]) || $.v.is.arr(obj[prop]))) {
            target[prop] = this.clone(obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    },
    clone: function(obj) {
      if ($.v.is.arr(obj)) {
        return this.extend(true, [], obj);
      } else if (this.isPlainObject(obj)) {
        return this.extend(true, {}, obj);
      } else {
        return obj;
      }
    },
    dup: function(obj) {
      if ($.v.is.arr(obj)) {
        return this.extend(false, [], obj);
      } else if (this.isPlainObject(obj)) {
        return this.extend(false, {}, obj);
      } else {
        return obj;
      }
    },
    isPlainObject: function(obj) {
      return $.v.is.obj(obj) && obj.constructor === Object;
    },
    createFromProto: function(obj) {
      return Object.create(obj);
    },
    randomItem: function(arr) {
      return arr[this.randomInt(arr.length - 1)];
    },
    randomInt: function() {
      var args, max, min, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        _ref = [0, args[0]], min = _ref[0], max = _ref[1];
      } else {
        min = args[0], max = args[1];
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    capitalize: function(str) {
      return str[0].toUpperCase() + str.slice(1);
    },
    ensureArray: function(arr) {
      if (arr.length === 1 && $.is.arr(arr[0])) arr = arr[0];
      return arr;
    },
    arrayDelete: function(arr, item) {
      return arr.splice(item, 1);
    }
  };

  game.util = util;

  window.scriptLoaded('app/util');

}).call(this);

(function() {
  var game, proto, _clone, _def, _extend, _fnContainsSuper, _wrap,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  _fnContainsSuper = function(fn) {
    return /\b_super(?:\.apply)?\(/.test(fn);
  };

  _wrap = function(original, _super) {
    var newfn;
    newfn = function() {
      var ret, tmp;
      tmp = this._super;
      Object.defineProperty(this, '_super', {
        value: _super,
        configurable: true
      });
      ret = original.apply(this, arguments);
      Object.defineProperty(this, '_super', {
        value: tmp,
        configurable: true
      });
      return ret;
    };
    newfn.__original__ = original;
    newfn.__super__ = _super;
    return newfn;
  };

  _clone = function(obj) {
    return Object.create(obj);
  };

  _extend = function(base, mixin, opts) {
    var exclusions, keyTranslations, properBaseName, properMixinName, sk, tk, _super;
    if (opts == null) opts = {};
    exclusions = opts.without ? $.v.reduce($.v.flatten([opts.without]), (function(h, v) {
      h[v] = 1;
      return h;
    }), {}) : {};
    keyTranslations = opts.keyTranslations || {};
    _super = base;
    if (typeof base.doesInclude === "function" ? base.doesInclude(mixin) : void 0) {
      return;
    }
    properBaseName = base.__name__ || 'A_BASE';
    properMixinName = mixin.__name__ || 'A_MIXIN';
    for (sk in mixin) {
      if (!__hasProp.call(mixin, sk)) continue;
      if (exclusions[sk]) continue;
      tk = keyTranslations[sk] || sk;
      if (typeof mixin[sk] === 'function' && (mixin[sk].__original__ != null)) {
        base[tk] = _wrap(mixin[sk].__original__, _super[tk]);
      } else if (typeof mixin[sk] === 'function' && _fnContainsSuper(mixin[sk]) && typeof _super[tk] === 'function') {
        base[tk] = _wrap(mixin[sk], _super[tk]);
      } else {
        base[tk] = mixin[sk];
      }
      if (typeof mixin.__extended__ === "function") mixin.__extended__(base);
    }
    return base;
  };

  proto = {};

  Object.defineProperty(proto, '__name__', {
    value: 'game.meta.proto',
    configurable: true
  });

  Object.defineProperty(proto, '_super', {
    value: function() {},
    configurable: true
  });

  proto.clone = function() {
    var clone;
    clone = _clone(this);
    Object.defineProperty(clone, '__mixins__', {
      value: game.util.dup(this.__mixins__),
      configurable: true
    });
    return clone;
  };

  proto.cloneAs = function(name) {
    var clone;
    clone = this.clone();
    Object.defineProperty(clone, '__name__', {
      value: name,
      configurable: true
    });
    return clone;
  };

  proto.create = function() {
    var args, clone;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    clone = this.clone();
    clone.init.apply(clone, args);
    return clone;
  };

  proto.init = function() {
    return this;
  };

  proto._includeMixin = function(mixin, opts) {
    if (opts == null) opts = {};
    _extend(this, mixin, opts);
    if (mixin.__name__) this.__mixins__[mixin.__name__] = 1;
    return this;
  };

  proto.include = proto.extend = function() {
    var mixin, mixins, _i, _len;
    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      this._includeMixin(mixin);
    }
    return this;
  };

  proto.aliases = function(map) {
    var self;
    self = this;
    $.v.each(map, function(orig, aliases) {
      var alias, _i, _len, _results;
      if (!$.v.is.arr(aliases)) aliases = [aliases];
      _results = [];
      for (_i = 0, _len = aliases.length; _i < _len; _i++) {
        alias = aliases[_i];
        _results.push(self[alias] = self[orig]);
      }
      return _results;
    });
    return this;
  };

  proto.doesInclude = function(obj) {
    if (typeof obj === 'string') {
      return this.__mixins__[obj];
    } else if (obj.__name__) {
      return this.__mixins__[obj.__name__];
    }
  };

  _def = function() {
    var mixins, name, obj;
    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (typeof mixins[0] === 'string') name = mixins.shift();
    obj = _clone(proto);
    if (name) {
      Object.defineProperty(obj, '__name__', {
        value: name,
        configurable: true
      });
    }
    Object.defineProperty(obj, '__mixins__', {
      value: {},
      configurable: true
    });
    obj.extend.apply(obj, mixins);
    return obj;
  };

  game.meta2 = {
    def: _def,
    extend: _extend,
    clone: _clone
  };

  window.scriptLoaded('app/meta2');

}).call(this);

(function() {
  var ROLES, assignable, attachable, drawable, eventHelpers, eventable, game, loadable, meta, runnable, simpleDrawable, tickable, _getSafeNameFrom,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  ROLES = ['game.eventable', 'game.attachable', 'game.tickable', 'game.drawable', 'game.simpleDrawable', 'game.loadable', 'game.runnable', 'game.assignable'];

  _getSafeNameFrom = function(obj) {
    var name, _ref;
    name = (_ref = obj.constructor.__name__) != null ? _ref : obj.__name__;
    return (name || "").replace(".", "_");
  };

  eventHelpers = {
    bindEvents: function(obj, events) {
      var fn, name, namespacedEvents, ns;
      ns = _getSafeNameFrom(obj);
      namespacedEvents = {};
      for (name in events) {
        fn = events[name];
        namespacedEvents[name + "." + ns] = fn;
      }
      return $(obj).bind(namespacedEvents);
    },
    unbindEvents: function() {
      var args, name, namespacedEventNames, ns, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      ns = _getSafeNameFrom(obj);
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + ns);
        }
        return _results;
      })();
      return (_ref = $(obj)).unbind.apply(_ref, namespacedEventNames);
    },
    triggerEvents: function() {
      var args, name, namespacedEventNames, ns, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      ns = _getSafeNameFrom(obj);
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + ns);
        }
        return _results;
      })();
      return (_ref = $(obj)).trigger.apply(_ref, namespacedEventNames);
    }
  };

  eventable = meta.def('game.eventable', {
    __extended__: function(base) {
      return base.extend(eventHelpers);
    },
    addEvents: function() {
      throw new Error('addEvents must be overridden');
    },
    removeEvents: function() {
      throw new Error('removeEvents must be overridden');
    },
    destroy: function() {
      this.removeEvents();
      return this._super();
    }
  });

  attachable = meta.def('game.attachable', {
    destroy: function() {
      this.detach();
      return this._super();
    },
    attachTo: function(parent) {
      if (typeof parent.doesInclude === "function" ? parent.doesInclude('game.attachable') : void 0) {
        this.$parentElement = parent.$element;
      } else {
        this.$parentElement = $(parent);
      }
      return this;
    },
    getElement: function() {
      return this.$element;
    },
    setElement: function($element) {
      this.$element = $element;
    },
    getParentElement: function() {
      return this.$parentElement;
    },
    attach: function() {
      if (this.$element) this.$parentElement.append(this.$element);
      return this;
    },
    detach: function() {
      var _ref;
      if ((_ref = this.$element) != null) _ref.detach();
      return this;
    }
  });

  tickable = meta.def('game.tickable', {
    tick: function() {
      throw new Error('tick must be overridden');
    }
  });

  simpleDrawable = meta.def('game.simpleDrawable', {
    draw: function() {
      throw new Error('draw must be overridden');
    }
  });

  drawable = meta.def('game.drawable', tickable, simpleDrawable, {
    tick: function(ctx) {
      this.predraw(ctx);
      this.draw(ctx);
      this.postdraw(ctx);
      return this;
    },
    predraw: function(ctx) {},
    postdraw: function(ctx) {}
  });

  loadable = meta.def('game.loadable', {
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      this.isLoaded = false;
      return this;
    },
    load: function() {
      throw new Error('load must be overridden');
    },
    isLoaded: function() {
      throw new Error('isLoaded must be overridden');
    }
  });

  runnable = meta.def('game.runnable', {
    destroy: function() {
      this.stop();
      return this._super();
    },
    start: function() {
      throw new Error('start must be overridden');
    },
    stop: function() {
      throw new Error('stop must be overridden');
    },
    suspend: function() {
      throw new Error('suspend must be overridden');
    },
    resume: function() {
      throw new Error('resume must be overridden');
    }
  });

  assignable = meta.def('game.assignable', {
    assignTo: function(parent) {
      this.parent = parent;
      return this;
    }
  });

  game.roles = {
    ROLES: ROLES,
    eventable: eventable,
    attachable: attachable,
    tickable: tickable,
    drawable: drawable,
    simpleDrawable: simpleDrawable,
    loadable: loadable,
    runnable: runnable,
    assignable: assignable
  };

  window.scriptLoaded('app/roles');

}).call(this);

(function() {
  var Bounds, game, meta, _boundsFrom,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _boundsFrom = function(mappableOrBounds) {
    var _ref;
    return (_ref = mappableOrBounds.mbounds) != null ? _ref : mappableOrBounds;
  };

  Bounds = meta.def('game.Bounds', {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    width: 0,
    height: 0,
    rect: function(x1, y1, width, height) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = x1;
      bounds.y1 = y1;
      bounds.width = width;
      bounds.height = height;
      bounds._calculateBottomRightCorner();
      return bounds;
    },
    at: function(x1, y1, x2, y2) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = x1;
      bounds.y1 = y1;
      bounds.x2 = x2;
      bounds.y2 = y2;
      bounds._calculateWidthAndHeight();
      return bounds;
    },
    withTranslation: function() {
      var args, bounds, x, y, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1 && $.is.obj(args[0])) {
        _ref = args[0], x = _ref.x, y = _ref.y;
      } else {
        x = args[0], y = args[1];
      }
      bounds = this.clone();
      if (x != null) {
        bounds.x1 += x;
        bounds.x2 += x;
      }
      if (y != null) {
        bounds.y1 += y;
        bounds.y2 += y;
      }
      return bounds;
    },
    withScale: function(amount) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = this.x1 + amount;
      bounds.x2 = this.x2 - amount;
      bounds.y1 = this.y1 + amount;
      bounds.y2 = this.y2 - amount;
      bounds.width = this.width - (amount * 2);
      bounds.height = this.height - (amount * 2);
      return bounds;
    },
    translate: function() {
      var args, vec;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 2) {
        vec = {};
        vec[args[0]] = args[1];
      } else {
        vec = args[0];
      }
      if (vec.x != null) {
        this.x1 += vec.x;
        this.x2 += vec.x;
      }
      if (vec.y != null) {
        this.y1 += vec.y;
        this.y2 += vec.y;
      }
      return this;
    },
    translateBySide: function(side, value) {
      var axis, diff, oldValue, otherSide, si, si_;
      axis = side[0], si = side[1];
      si_ = si === "2" ? 1 : 2;
      otherSide = axis + si_;
      oldValue = this[side];
      diff = value - oldValue;
      this[side] = value;
      this[otherSide] += diff;
      return diff;
    },
    anchor: function(x1, y1) {
      this.x1 = x1;
      this.x2 = x1 + this.width;
      this.y1 = y1;
      this.y2 = y1 + this.height;
      return this;
    },
    withAnchor: function(x1, y1) {
      return this.clone().anchor(x1, y1);
    },
    replace: function(bounds) {
      this.width = bounds.width;
      this.height = bounds.height;
      this.x1 = bounds.x1;
      this.x2 = bounds.x2;
      this.y1 = bounds.y1;
      this.y2 = bounds.y2;
      return this;
    },
    intersectWith: function(other) {
      var x1i, x2i, xo, y1i, y2i, yo, _ref, _ref2, _ref3, _ref4;
      other = _boundsFrom(other);
      x1i = (other.x1 < (_ref = this.x1) && _ref < other.x2);
      x2i = (other.x1 < (_ref2 = this.x2) && _ref2 < other.x2);
      xo = this.x1 <= other.x1 && this.x2 >= other.x2;
      y1i = (other.y1 < (_ref3 = this.y1) && _ref3 < other.y2);
      y2i = (other.y1 < (_ref4 = this.y2) && _ref4 < other.y2);
      yo = this.y1 <= other.y1 && this.y2 >= other.y2;
      return (x1i || x2i || xo) && (y1i || y2i || yo);
    },
    getOuterLeftEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.x1;
    },
    getOuterRightEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.x2;
    },
    getOuterTopEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.y1;
    },
    getOuterBottomEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.y2;
    },
    doesContain: function(other) {
      other = _boundsFrom(other);
      return (other.x2 > this.x1 && other.x1 < this.x2) || (other.y2 > this.y1 && other.y1 < this.y2);
    },
    getInnerLeftEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.x1 < this.x1) return this.x1;
    },
    getInnerRightEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.x2 > this.x2) return this.x2;
    },
    getInnerTopEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.y1 < this.y1) return this.y1;
    },
    getInnerBottomEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.y2 > this.y2) return this.y2;
    },
    draw: function(main) {
      var ctx;
      ctx = main.viewport.canvas.ctx;
      return ctx.strokeRect(this.x1 - 0.5, this.y1 - 0.5, this.width, this.height);
    },
    inspect: function() {
      return "(" + this.x1 + "," + this.y1 + ") to (" + this.x2 + "," + this.y2 + "), " + this.width + "x" + this.height;
    },
    _calculateBottomRightCorner: function() {
      this.x2 = this.x1 + this.width;
      return this.y2 = this.y1 + this.height;
    },
    _calculateWidthAndHeight: function() {
      this.width = this.x2 - this.x1;
      return this.height = this.y2 - this.y1;
    }
  });

  Bounds.intersectsWith = Bounds.intersectWith;

  game.Bounds = Bounds;

  window.scriptLoaded('app/bounds');

}).call(this);

(function() {
  var Pixel, canvas, contextExt, game, imageDataExt,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  Pixel = (function() {

    function Pixel(x, y, red, green, blue, alpha) {
      this.x = x;
      this.y = y;
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.alpha = alpha;
    }

    Pixel.prototype.isFilled = function() {
      return this.red || this.green || this.blue || this.alpha;
    };

    Pixel.prototype.isTransparent = function() {
      return !this.isFilled();
    };

    return Pixel;

  })();

  contextExt = {
    extend: function(ctx) {
      var createImageData, getImageData;
      getImageData = ctx.getImageData;
      createImageData = ctx.createImageData;
      return $.extend(ctx, {
        getImageData: function(x, y, width, height) {
          var imageData;
          imageData = getImageData.apply(this, arguments);
          imageDataExt.extend(imageData);
          return imageData;
        },
        createImageData: function(width, height) {
          var imageData;
          imageData = createImageData.apply(this, arguments);
          imageDataExt.extend(imageData);
          return imageData;
        }
      });
    }
  };

  imageDataExt = {
    extend: function(imageData) {
      return $.extend(imageData, {
        getPixel: function(x, y) {
          var data, i;
          i = (x + y * this.width) * 4;
          data = this.data;
          return {
            red: data[i + 0],
            green: data[i + 1],
            blue: data[i + 2],
            alpha: data[i + 3]
          };
        },
        setPixel: function(x, y, r, g, b, a) {
          var i;
          if (a == null) a = 255;
          i = (x + (y * this.width)) * 4;
          this.data[i + 0] = r;
          this.data[i + 1] = g;
          this.data[i + 2] = b;
          return this.data[i + 3] = a;
        },
        each: function(fn) {
          var a, b, data, g, i, len, pi, pixel, r, x, y, _ref, _ref2, _results;
          data = this.data;
          _ref = [0, data.length], i = _ref[0], len = _ref[1];
          _results = [];
          while (i < len) {
            _ref2 = [data[i], data[i + 1], data[i + 2], data[i + 3]], r = _ref2[0], g = _ref2[1], b = _ref2[2], a = _ref2[3];
            pi = Math.floor(i / 4);
            y = Math.floor(pi / this.width);
            x = pi - (y * this.width);
            pixel = new Pixel(x, y, r, g, b, a);
            fn(pixel);
            _results.push(i += 4);
          }
          return _results;
        }
      });
    }
  };

  canvas = {
    create: function() {
      var $element, args, c, height, id, parent, width, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = args.reverse(), height = _ref[0], width = _ref[1], id = _ref[2], parent = _ref[3];
      $element = $("<canvas/>").attr('width', width).attr('height', height);
      if (id) $element.attr('id', id);
      c = {};
      c.width = width;
      c.height = height;
      c.$element = $element;
      c.element = c.$element[0];
      c.getContext = function() {
        var ctx;
        ctx = this.element.getContext("2d");
        return ctx;
      };
      c.attach = function() {
        this.$element.appendTo(parent);
        this.element = this.$element[0];
        return this;
      };
      c.appendTo = function(parent) {
        this.$element.appendTo(parent);
        this.element = this.$element[0];
        return this;
      };
      return c;
    }
  };

  game.canvas = canvas;

  window.scriptLoaded('app/canvas');

}).call(this);

(function() {
  var Collidable, game, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Collidable = meta.def('game.Collidable', {
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      return this._initCollidableBounds();
    },
    assignToMap: function(map) {
      this._super(map);
      this._initCollidables();
      return this;
    },
    doToMapBounds: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.map.objects.remove(this);
      this._super.apply(this, args);
      return this.map.objects.add(this);
    },
    setMapPosition: function(x, y) {
      this._super(x, y);
      return this.cbounds.anchor(x, y);
    },
    translate: function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      return (_ref = this.cbounds).translate.apply(_ref, args);
    },
    translateBySide: function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      return (_ref = this.cbounds).translateBySide.apply(_ref, args);
    },
    intersectsWith: function(other) {
      return this.cbounds.intersectsWith(other);
    },
    getOuterLeftEdgeBlocking: function(other) {
      return this.cbounds.getOuterLeftEdgeBlocking(other);
    },
    getOuterRightEdgeBlocking: function(other) {
      return this.cbounds.getOuterRightEdgeBlocking(other);
    },
    getOuterTopEdgeBlocking: function(other) {
      return this.cbounds.getOuterTopEdgeBlocking(other);
    },
    getOuterBottomEdgeBlocking: function(other) {
      return this.cbounds.getOuterBottomEdgeBlocking(other);
    },
    _initCollidableBounds: function() {
      return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height - 8);
    },
    _initCollidables: function() {
      return this.mapCollidables = this.map.getObjectsWithout(this);
    }
  });

  game.Collidable = Collidable;

  window.scriptLoaded('app/collidable');

}).call(this);

(function() {
  var ImageSequence, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  ImageSequence = meta.def('game.ImageSequence', assignable, simpleDrawable, {
    init: function(image, width, height, frameIndices, opts) {
      this.image = image;
      this.width = width;
      this.height = height;
      this.frameIndices = frameIndices;
      if (opts == null) opts = {};
      this.numFrames = this.frameIndices.length;
      this.frameDelay = opts.frameDelay || 0;
      this.frameDuration = opts.frameDuration || 1;
      this.doesRepeat = opts.doesRepeat;
      return this.reset();
    },
    reset: function() {
      this.numDraws = 0;
      this.currentFrame = 0;
      return this.lastDrawAt = null;
    },
    draw: function(ctx, x, y) {
      var yOffset;
      if (this.frameDelay > 0) {
        this.frameDelay--;
        return;
      }
      yOffset = this.getCurrentFrame() * this.height;
      ctx.drawImage(this.image.element, 0, yOffset, this.width, this.height, x, y, this.width, this.height);
      this.lastDrawAt = [x, y];
      if ((this.numDraws % this.frameDuration) === 0) this.currentFrame++;
      if (this.currentFrame === this.numFrames) {
        if (this.doesRepeat) {
          this.currentFrame = 0;
        } else {
          if (typeof this.onEndCallback === "function") this.onEndCallback();
        }
      }
      this.numDraws++;
    },
    clear: function(ctx, x, y) {
      if (!this.lastDrawAt) return;
      return ctx.clearRect(this.lastDrawAt[0], this.lastDrawAt[1], this.width, this.height);
    },
    getCurrentFrame: function() {
      var frame;
      frame = this.frameIndices[this.currentFrame];
      if (frame == null) throw new Error('frame is undefined');
      return frame;
    },
    getYOffset: function() {
      return this.getCurrentFrame() * this.height;
    },
    onEnd: function(callback) {
      return this.onEndCallback = callback;
    }
  });

  game.ImageSequence = ImageSequence;

  window.scriptLoaded('app/image_sequence');

}).call(this);

(function() {
  var KEYS, KeyTracker, MODIFIER_KEYS, PressedKeys, eventable, game, keyboard, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  eventable = game.roles.eventable;

  KEYS = {
    KEY_TAB: 9,
    KEY_ESC: 27,
    KEY_SHIFT: 16,
    KEY_CTRL: 17,
    KEY_ALT: 18,
    KEY_META: 91,
    KEY_UP: 38,
    KEY_DOWN: 40,
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_W: 87,
    KEY_A: 65,
    KEY_S: 83,
    KEY_D: 68,
    KEY_H: 72,
    KEY_J: 74,
    KEY_K: 75,
    KEY_L: 76
  };

  MODIFIER_KEYS = [KEYS.KEY_SHIFT, KEYS.KEY_CTRL, KEYS.KEY_ALT, KEYS.KEY_META];

  PressedKeys = meta.def({
    init: function() {
      return this.reset();
    },
    reset: function() {
      this.tsByKey = {};
      return this.keys = [];
    },
    get: function(key) {
      return this.tsByKey[key];
    },
    put: function(key, ts) {
      if (this.has(key)) this.del(key);
      this.tsByKey[key] = ts;
      return this.keys.unshift(key);
    },
    del: function(key) {
      var ts;
      if (this.has(key)) {
        ts = this.tsByKey[key];
        delete this.tsByKey[key];
        return this.keys.splice(this.keys.indexOf(key), 1);
      }
    },
    has: function(key) {
      return this.tsByKey.hasOwnProperty(key);
    },
    each: function(fn) {
      var key, _i, _len, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(fn(key, this.tsByKey[key]));
      }
      return _results;
    }
  });

  KeyTracker = meta.def({
    init: function(keyCodes) {
      this.trackedKeys = $.v.reduce(keyCodes, (function(o, c) {
        o[c] = 1;
        return o;
      }), {});
      return this.pressedKeys = PressedKeys.create();
    },
    reset: function() {
      this.pressedKeys.reset();
      return this;
    },
    keydown: function(keyCode, ts) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.put(keyCode, ts);
        return true;
      }
      return false;
    },
    keyup: function(keyCode) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.del(keyCode);
        return true;
      }
      return false;
    },
    isKeyPressed: function() {
      var key, keyCode, keys, _i, _len, _ref;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = $.flatten(keys);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        keyCode = keyboard.keyCodeFor(key);
        if (self.pressedKeys.has(keyCode)) return true;
      }
      return false;
    },
    clearStuckKeys: function(now) {
      var self;
      self = this;
      return this.pressedKeys.each(function(key, ts) {
        if ((now - ts) >= 500) return self.pressedKeys.del(key);
      });
    },
    getLastPressedKey: function() {
      return this.pressedKeys.keys[0];
    }
  });

  keyboard = meta.def('game.keyboard', eventable, {
    KeyTracker: KeyTracker,
    keys: KEYS,
    modifierKeys: MODIFIER_KEYS,
    keyTrackers: [],
    reset: function() {
      var keyTracker, _i, _len, _ref;
      if (this.keyTrackers) {
        _ref = this.keyTrackers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          keyTracker = _ref[_i];
          keyTracker.reset();
        }
      }
      return this;
    },
    addEvents: function() {
      var self;
      self = this;
      this.bindEvents(document, {
        keydown: function(event) {
          var isTracked, key, keyTracker, _i, _len, _ref;
          key = event.keyCode;
          isTracked = false;
          _ref = self.keyTrackers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            keyTracker = _ref[_i];
            if (keyTracker.keydown(key, event.timeStamp)) isTracked = true;
          }
          if (isTracked) {
            event.preventDefault();
            return false;
          }
        },
        keyup: function(event) {
          var isTracked, key, keyTracker, _i, _len, _ref;
          key = event.keyCode;
          isTracked = false;
          _ref = self.keyTrackers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            keyTracker = _ref[_i];
            if (keyTracker.keyup(key)) isTracked = true;
          }
          if (isTracked) {
            event.preventDefault();
            return false;
          }
        }
      });
      this.bindEvents(window, {
        blur: function(event) {
          return self.reset();
        }
      });
      return this;
    },
    removeEvents: function() {
      this.unbindEvents(document, 'keydown', 'keyup');
      this.unbindEvents(window, 'blur');
      return this;
    },
    addKeyTracker: function(tracker) {
      this.keyTrackers.push(tracker);
      return this;
    },
    removeKeyTracker: function(tracker) {
      this.keyTrackers.splice(this.keyTrackers.indexOf(tracker), 1);
      return this;
    },
    trapKeys: function() {
      var key, keys, _i, _len;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      keys = game.util.ensureArray(keys);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (typeof key === 'string') key = KEYS[key];
        this.trappedKeys[key] = 1;
      }
      return this;
    },
    releaseKeys: function() {
      var key, keys, _i, _len;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      keys = game.util.ensureArray(keys);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (typeof key === 'string') key = KEYS[key];
        delete this.trappedKeys[key];
      }
      return this;
    },
    isKeyPressed: function() {
      var keys, tracker;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if ((function() {
        var _i, _len, _ref, _results;
        _ref = this.keyTrackers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tracker = _ref[_i];
          _results.push(tracker.isKeyPressed(keys));
        }
        return _results;
      }).call(this)) {
        return true;
      }
      return false;
    },
    clearStuckKeys: function(now) {
      var tracker, _i, _len, _ref;
      _ref = this.keyTrackers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tracker = _ref[_i];
        tracker.clearStuckKeys(now);
      }
      return this;
    },
    modifierKeyPressed: function(event) {
      return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
    },
    keyCodesFor: function() {
      var keys;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      keys = game.util.ensureArray(keys);
      return $.map(keys, function(key) {
        return keyboard.keyCodeFor(key);
      });
    },
    keyCodeFor: function(key) {
      var keyCode;
      if (typeof key === 'string') {
        keyCode = KEYS[key];
        if (!keyCode) throw new Error("'" + arg + "' is not a valid key");
        return keyCode;
      } else {
        return key;
      }
    }
  });

  game.keyboard = keyboard;

  window.scriptLoaded('app/keyboard');

}).call(this);

(function() {
  var attachable, eventable, fpsReporter, game, main, meta, runnable, tickable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, eventable = _ref.eventable, attachable = _ref.attachable, tickable = _ref.tickable, runnable = _ref.runnable;

  fpsReporter = game.fpsReporter;

  main = meta.def('game.main', eventable, attachable, tickable, runnable, {
    imagesPath: '/images',
    debug: false,
    init: function() {
      this.attachTo(document.body);
      this.setElement($('#game'));
      this.$controlsDiv = $('<div id="controls">');
      this.keyboard = game.keyboard.init();
      this.core = game.core.init(this);
      this.fpsReporter = game.fpsReporter.init(this);
      this.addEvents();
      this.run();
      return this;
    },
    getControlsDiv: function() {
      return this.$controlsDiv;
    },
    attach: function() {
      this._super();
      this.core.attach();
      this.fpsReporter.attach();
      this.getElement().append(this.$controlsDiv);
      return this;
    },
    addEvents: function() {
      var self;
      self = this;
      this.keyboard.addEvents();
      this.bindEvents(window, {
        blur: function() {
          return self.suspend();
        },
        focus: function() {
          return self.resume();
        }
      });
      return this;
    },
    removeEvents: function() {
      this.keyboard.removeEvents();
      this.unbindEvents(window, 'blur', 'focus');
      return this;
    },
    load: function(callback) {
      var assetCollections, c, fn, self, t, timer, _i, _len;
      self = this;
      assetCollections = [];
      assetCollections.push(game.imageCollection);
      t = new Date();
      timer = null;
      fn = function() {
        var isLoaded, t2;
        t2 = new Date();
        if ((t2 - t) > (10 * 1000)) {
          window.clearTimeout(timer);
          timer = null;
          console.log("Not all assets were loaded!");
          return;
        }
        console.log("Checking to see if all assets have been loaded...");
        isLoaded = $.v.every(assetCollections, function(c) {
          return c.isLoaded();
        });
        if (isLoaded) {
          console.log("Yup, looks like all assets are loaded now.");
          window.clearTimeout(timer);
          timer = null;
          return callback();
        } else {
          return timer = window.setTimeout(fn, 300);
        }
      };
      fn();
      for (_i = 0, _len = assetCollections.length; _i < _len; _i++) {
        c = assetCollections[_i];
        c.load();
      }
      return this;
    },
    run: function() {
      var self;
      self = this;
      main.load(function() {
        self.attach();
        return self.core.run();
      });
      return this;
    },
    start: function() {
      this.core.start();
      return this;
    },
    stop: function() {
      this.core.stop();
      return this;
    },
    suspend: function() {
      console.log("Suspending...");
      this.core.suspend();
      this.fpsReporter.suspend();
      return this;
    },
    resume: function() {
      console.log("Resuming...");
      this.core.resume();
      this.fpsReporter.resume();
      return this;
    },
    resolveImagePath: function(path) {
      return "" + this.imagesPath + "/" + path;
    }
  });

  game.main = main;

  window.scriptLoaded('app/main');

}).call(this);

(function() {
  var Mappable, game, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Mappable = meta.def('game.Mappable', {
    init: function(width, height) {
      this.width = width;
      this.height = height;
      this._initMappableBounds();
      this._initPrevMappableBounds();
      return this;
    },
    assignToMap: function(map) {
      this.assignTo(map);
      this.map = map;
      this.viewport = this.map.viewport;
      return this;
    },
    doToMapBounds: function() {
      var args, methodName, _ref;
      methodName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.mbounds)[methodName].apply(_ref, args);
    },
    setMapPosition: function(x, y) {
      return this.doToMapBounds('anchor', x, y);
    },
    recalculateViewportBounds: function() {
      var x1, y1;
      x1 = this.mbounds.x1 - this.viewport.bounds.x1;
      y1 = this.mbounds.y1 - this.viewport.bounds.y1;
      return this.vbounds.anchor(x1, y1);
    },
    inspect: function() {
      return JSON.stringify({
        "vbounds": this.vbounds.inspect(),
        "mbounds": this.mbounds.inspect()
      });
    },
    debug: function() {
      console.log("vbounds = " + (this.vbounds.inspect()));
      return console.log("mbounds = " + (this.mbounds.inspect()));
    },
    _initMappableBounds: function() {
      this._initBoundsOnMap();
      return this._initBoundsInViewport();
    },
    _initPrevMappableBounds: function() {
      this.prev = {};
      this.prev.mbounds = this.mbounds;
      return this.prev.vbounds = this.vbounds;
    },
    _initBoundsOnMap: function() {
      return this.mbounds = game.Bounds.rect(0, 0, this.width, this.height);
    },
    _initBoundsInViewport: function() {
      return this.vbounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.Mappable = Mappable;

  window.scriptLoaded('app/mappable');

}).call(this);

(function() {
  var OrderedMap, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  OrderedMap = meta.def('game.OrderedMap', {
    init: function() {
      this.keys = [];
      return this.map = {};
    },
    get: function(k) {
      return this.map[k];
    },
    set: function(k, v) {
      this.keys.push(k);
      this.map[k] = v;
      this.keys = this.keys.sort();
      return v;
    },
    "delete": function(k) {
      this.keys["delete"](k);
      return delete this.map[k];
    },
    each: function(fn) {
      var k, ret, v, _i, _len, _ref;
      _ref = this.keys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (k != null) {
          v = this.map[k];
          ret = fn(v);
          if (ret === false) return false;
        }
      }
    },
    getKeys: function() {
      return this.keys;
    },
    getValues: function(fn) {
      var values;
      values = [];
      this.each(function(v) {
        return values.push(v);
      });
      return values;
    },
    isEmpty: function() {
      return this.keys.length === 0;
    }
  });

  game.OrderedMap = OrderedMap;

  window.scriptLoaded('app/ordered_map');

}).call(this);

(function() {
  var attachable, game, meta, tickable, viewport, _ref,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, attachable = _ref.attachable, tickable = _ref.tickable;

  viewport = meta.def('game.viewport', attachable, {
    width: 512,
    height: 448,
    init: function(core, player) {
      this.core = core;
      this.player = player;
      this.attachTo(this.core);
      this.setElement($('<div id="viewport" />').css({
        width: this.width,
        height: this.height
      }));
      this.bounds = game.Bounds.rect(0, 0, this.width, this.height);
      return this;
    },
    attach: function() {
      this.getParentElement().html("");
      this._super();
      return this.getParentElement().append('<p>Controls: arrow keys (WASD also works too)</p>');
    },
    setMap: function(map) {
      this.currentMap = map;
      return this._setBounds();
    },
    unsetMap: function() {
      return this.currentMap.detach();
    },
    translate: function() {
      var args, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref2 = this.bounds).translate.apply(_ref2, args);
      return this;
    },
    translateBySide: function(side, value) {
      var ret;
      ret = this.bounds.translateBySide(side, value);
      return ret;
    },
    inspect: function() {
      return JSON.stringify({
        "bounds": this.bounds.inspect()
      });
    },
    debug: function() {
      return console.log("viewport.bounds = " + (this.bounds.inspect()));
    },
    _setBounds: function() {
      var p, pb, phh, pwh, vhh, vwh, x1, y1;
      p = this.core.player;
      pb = p.mbounds;
      pwh = Math.round(p.width / 2);
      phh = Math.round(p.height / 2);
      vwh = Math.round(this.width / 2);
      vhh = Math.round(this.height / 2);
      x1 = pb.x1 + pwh - vwh;
      if (x1 < 0) x1 = 0;
      y1 = pb.y1 + phh - vhh;
      if (y1 < 0) y1 = 0;
      return this.bounds.anchor(x1, y1);
    }
  });

  game.viewport = viewport;

  window.scriptLoaded('app/viewport');

}).call(this);

(function() {
  var SortedObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  SortedObjectMatrix = meta.def('game.SortedObjectMatrix', {
    init: function(map) {
      this.map = map;
      return this.rows = game.OrderedMap.create();
    },
    add: function(object) {
      var row, x, y, _ref;
      _ref = [object.mbounds.y1, object.mbounds.x1], y = _ref[0], x = _ref[1];
      if (!(row = this.rows.get(y))) {
        row = game.OrderedMap.create();
        this.rows.set(y, row);
      }
      return row.set(x, object);
    },
    remove: function(object) {
      var row, x, y, _ref;
      _ref = [object.mbounds.y1, object.mbounds.x1], y = _ref[0], x = _ref[1];
      if (row = this.rows.get(y)) {
        row["delete"](x);
        if (row.isEmpty()) return this.rows["delete"](y);
      }
    },
    each: function(fn) {
      return this.rows.each(function(row) {
        var ret;
        ret = row.each(function(object) {
          var ret2;
          ret2 = fn(object);
          if (ret2 === false) return false;
        });
        if (ret === false) return false;
      });
    },
    getObjects: function() {
      var objects;
      objects = [];
      this.each(function(object) {
        return objects.push(object);
      });
      return objects;
    }
  });

  SortedObjectMatrix.aliases({
    add: 'push',
    remove: 'delete'
  });

  game.SortedObjectMatrix = SortedObjectMatrix;

  window.scriptLoaded('app/sorted_object_matrix');

}).call(this);

(function() {
  var CollidableMatrix, SortedObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  SortedObjectMatrix = game.SortedObjectMatrix;

  CollidableMatrix = SortedObjectMatrix.cloneAs('game.CollidableMatrix').extend({
    intersectsWith: function(other) {
      var ret;
      ret = false;
      this.each(function(collidable) {
        if (collidable.intersectsWith(other)) {
          ret = true;
          return false;
        }
      });
      return ret;
    },
    getOuterLeftEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterLeftEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterRightEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterRightEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterTopEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterTopEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterBottomEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterBottomEdgeBlocking(other)) return false;
      });
      return ret;
    }
  });

  game.CollidableMatrix = CollidableMatrix;

  window.scriptLoaded('app/collidable_matrix');

}).call(this);

(function() {
  var FramedObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  FramedObjectMatrix = meta.def('game.FramedObjectMatrix', {
    frameWithin: function(bounds) {
      this.bounds = bounds;
      return this;
    },
    each: function(fn) {
      var self;
      self = this;
      return this._super(function(object) {
        var ret;
        if (self.bounds.doesContain(object)) {
          ret = fn(object);
          if (ret === false) return false;
        }
      });
    }
  });

  game.FramedObjectMatrix = FramedObjectMatrix;

  window.scriptLoaded('app/framed_object_matrix');

}).call(this);

(function() {
  var FilteredObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  FilteredObjectMatrix = meta.def('game.FilteredObjectMatrix', {
    without: function(exception) {
      this.exception = exception;
      return this;
    },
    each: function(fn) {
      var self;
      self = this;
      return this._super(function(object) {
        var ret;
        if (object !== self.exception) {
          ret = fn(object);
          if (ret === false) return false;
        }
      });
    }
  });

  game.FilteredObjectMatrix = FilteredObjectMatrix;

  window.scriptLoaded('app/filtered_object_matrix');

}).call(this);

(function() {
  var game, meta, runnable, tickable, ticker, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, runnable = _ref.runnable, tickable = _ref.tickable;

  ticker = meta.def('game.ticker', runnable, tickable, {
    isRunning: false,
    _includeMixin: function(mixin, opts) {
      if (opts == null) opts = {};
      opts = $.v.extend({}, opts, {
        keyTranslations: {
          start: '_start',
          stop: '_stop'
        }
      });
      return this._super(mixin, opts);
    },
    destroy: function() {
      return this.stop();
    },
    run: function() {
      return this.start();
    },
    start: function() {
      if (this.isRunning) return;
      this.isRunning = true;
      this._start();
      return this;
    },
    _start: function() {},
    stop: function() {
      if (!this.isRunning) return;
      this.isRunning = false;
      this._stop();
      return this;
    },
    _stop: function() {},
    suspend: function() {
      this.wasRunning = this.isRunning;
      return this.stop();
    },
    resume: function() {
      if (this.wasRunning) return this.start();
    },
    tick: function() {
      throw new Error('You need to override #tick');
    }
  });

  game.ticker = ticker;

  window.scriptLoaded('app/ticker');

}).call(this);

(function() {
  var attachable, core, game, tickable, ticker, _ref;

  game = (window.game || (window.game = {}));

  ticker = game.ticker;

  _ref = game.roles, attachable = _ref.attachable, tickable = _ref.tickable;

  core = ticker.cloneAs('game.core').extend(attachable, tickable, {
    frameRate: 40,
    animMethod: 'setTimeout',
    init: function(main) {
      var draw;
      this.main = main;
      this.attachTo(this.main);
      this.setElement(this.main.getElement());
      this.player = game.player.assignTo(this);
      this.keyboard = this.main.keyboard;
      this.viewport = game.viewport.init(this, this.player);
      this.tickInterval = 1000 / this.frameRate;
      draw = this.draw;
      this.throttledDrawFn = this.createIntervalTimer(this.tickInterval, function(df, dt) {
        return draw(df, dt);
      });
      this.numDraws = 0;
      this.lastTickTime = null;
      this.numTicks = 0;
      return this;
    },
    attach: function() {
      return this.viewport.attach();
    },
    run: function() {
      this.loadMap('lw_52');
      return this._super();
    },
    start: function() {
      return this.tick();
    },
    stop: function() {
      if (this.timer) {
        if (this.animMethod === 'setTimeout') {
          window.clearTimeout(this.timer);
        } else {
          window.cancelRequestAnimFrame(this.timer);
        }
        return this.timer = null;
      }
    },
    tick: function() {
      var msDrawTime, t, t2;
      t = (new Date()).getTime();
      if (core.main.debug) {
        core.msSinceLastDraw = core.lastTickTime ? t - core.lastTickTime : 0;
        console.log("msSinceLastDraw: " + core.msSinceLastDraw);
      }
      if (core.animMethod === 'setTimeout') {
        core.draw();
      } else {
        core.throttledDrawFn();
      }
      if (core.main.debug) {
        t2 = (new Date()).getTime();
        msDrawTime = t2 - t;
        core.lastTickTime = t;
        console.log("msDrawTime: " + msDrawTime);
      }
      if ((core.numTicks % 100) === 0) core.keyboard.clearStuckKeys(t);
      if (core.animMethod === 'setTimeout') {
        core.timer = window.setTimeout(core.tick, core.tickInterval);
      } else {
        core.timer = window.requestAnimFrame(core.tick, viewport.canvas.element);
      }
      return core.numTicks++;
    },
    draw: function() {
      this.currentMap.tick();
      return this.numDraws++;
    },
    loadMap: function(name) {
      var map, self;
      self = this;
      if (map = this.currentMap) {
        map.deactivate();
        map.detachFromViewport();
        map.unload();
        map.removePlayer();
      }
      map = game.mapCollection.get(name);
      map.assignTo(this.viewport);
      map.addPlayer(this.player);
      map.load();
      map.attachToViewport();
      this.viewport.setMap(map);
      map.activate();
      return this.currentMap = map;
    },
    createIntervalTimer: function(arg, fn) {
      var always, f0, interval, self, t0;
      self = this;
      if (arg === true) {
        always = true;
      } else {
        interval = arg;
      }
      t0 = (new Date()).getTime();
      f0 = this.numDraws;
      return function() {
        var df, dt, t;
        t = (new Date()).getTime();
        dt = t - t0;
        df = self.numDraws - f0;
        if (always || dt >= interval) {
          fn(df, dt);
          t0 = (new Date()).getTime();
          return f0 = self.numDraws;
        }
      };
    }
  });

  game.core = core;

  window.scriptLoaded('app/core');

}).call(this);

(function() {
  var attachable, fpsReporter, game, meta, ticker;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  ticker = game.ticker;

  attachable = game.roles.attachable;

  fpsReporter = ticker.cloneAs('game.fpsReporter').extend(attachable, {
    init: function(main) {
      var self;
      this.main = main;
      self = this;
      this.attachTo(this.main.core.viewport);
      this.setElement($('<div class="fps-reporter">00.0 FPS</div>'));
      this._initCheckbox();
      this.$playerDebug = $('<p/>');
      this.tickInterval = 1000;
      this.drawFn = game.core.createIntervalTimer(false, function(df, dt) {
        return self.draw(self, df, dt);
      });
      this.disable();
      return this;
    },
    attach: function() {
      this._super();
      this.main.getControlsDiv().append(this.$checkbox);
      return this.main.getControlsDiv().append(this.$playerDebug);
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable();
      } else {
        return this.enable();
      }
    },
    enable: function() {
      this.getElement().show();
      this.start();
      return this.isEnabled = true;
    },
    disable: function() {
      this.getElement().hide().removeClass('first-draw');
      this.stop();
      return this.isEnabled = false;
    },
    start: function() {
      return this.timer = window.setInterval(this.drawFn, this.tickInterval);
    },
    stop: function() {
      if (this.timer) {
        window.clearInterval(this.timer);
        return this.timer = null;
      }
    },
    draw: function(fpsReporter, df, dt) {
      var fps;
      fps = ((df / dt) * 1000).toFixed(1);
      fpsReporter.getElement().addClass('first-draw').text("" + fps + " FPS");
      return this.$playerDebug.html(this.main.core.player.mbounds.inspect());
    },
    _initCheckbox: function() {
      var self;
      self = this;
      this.$checkbox = $('\
      <p class="fps-reporter">\
        <label>\
          <input type="checkbox" />\
          Show FPS\
        </label>\
      </p>\
    ');
      return this.$checkbox.on('change', function() {
        return self.toggle();
      });
    }
  });

  game.fpsReporter = fpsReporter;

  window.scriptLoaded('app/fps_reporter');

}).call(this);

(function() {
  var Block, Collidable, Mappable, assignable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  assignable = game.roles.assignable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  Block = meta.def('game.Block', assignable, Mappable, Collidable, {
    _initCollidableBounds: function() {
      return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.Block = Block;

  window.scriptLoaded('app/block');

}).call(this);

(function() {
  var Block, Collidable, Mappable, StillObject, assignable, drawable, game, meta, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Block = game.Block;

  _ref = game.roles, assignable = _ref.assignable, drawable = _ref.drawable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  StillObject = meta.def('game.StillObject', assignable, Mappable, Collidable, drawable, {
    init: function(imagePath, width, height) {
      this._super(width, height);
      this.image = game.imageCollection.get(imagePath);
      return this;
    },
    activate: function() {},
    deactivate: function() {},
    predraw: function(ctx) {
      return this.image.clear(ctx, this.mbounds.x1, this.mbounds.y1);
    },
    draw: function(ctx) {
      return this.image.draw(ctx, this.mbounds.x1, this.mbounds.y1);
    }
  });

  game.StillObject = StillObject;

  window.scriptLoaded('app/still_object');

}).call(this);

(function() {
  var LiveObject, StillObject, game, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  StillObject = game.StillObject;

  LiveObject = StillObject.cloneAs('game.LiveObject').extend({
    states: {},
    clone: function() {
      var clone;
      clone = this._super();
      clone.states = game.util.dup(clone.states);
      return clone;
    },
    predraw: function(ctx) {
      var fn;
      this.currentState.sequence.clear(ctx, this.mbounds.x1, this.mbounds.y1);
      if (fn = this.currentState.handler) {
        if (typeof fn === 'function') {
          this.fn();
        } else {
          this[fn]();
        }
        return this.recalculateViewportBounds();
      }
    },
    draw: function(ctx) {
      return this.currentState.sequence.draw(ctx, this.mbounds.x1, this.mbounds.y1);
    },
    addState: function(name, frameIndices, opts) {
      var seq, state;
      if (opts == null) opts = {};
      state = {};
      state.name = name;
      state.handler = opts["do"];
      state.onEnd = opts.then || name;
      seq = game.ImageSequence.create(this.image, this.width, this.height, frameIndices, {
        frameDelay: opts.frameDelay,
        frameDuration: opts.frameDuration,
        doesRepeat: opts.doesRepeat
      });
      seq.assignTo(this);
      seq.onEnd(state.onEnd);
      state.sequence = seq;
      return this.states[name] = state;
    },
    setState: function(name) {
      this.currentState = this.states[name];
      this.recalculateViewportBounds();
      this.currentState.sequence.reset();
      if (!this.currentState) throw new Error("Unknown state '" + name + "'!");
      return this.currentState;
    },
    translate: function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.vbounds).translate.apply(_ref, args);
      return this.doToMapBounds.apply(this, ['translate'].concat(__slice.call(args)));
    },
    translateBySide: function(side, value) {
      var axis, distMoved;
      axis = side[0];
      distMoved = this.doToMapBounds('translateBySide', side, value);
      this.vbounds.translate(axis, distMoved);
      return distMoved;
    },
    _initBoundsOnMap: function() {
      this._initFence();
      return this._super();
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(0, 0, this.map.width, this.map.height);
    }
  });

  game.LiveObject = LiveObject;

  window.scriptLoaded('app/live_object');

}).call(this);

(function() {
  var Image, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  Image = meta.def('game.Image', assignable, simpleDrawable, {
    init: function(path, width, height) {
      this.width = width;
      this.height = height;
      this.path = path;
      if (!/\.[^.]+$/.test(this.path)) this.path += ".gif";
      if (!/^\//.test(this.path)) {
        this.path = game.main.resolveImagePath(this.path);
      }
      return this.isLoaded = false;
    },
    load: function() {
      var self;
      self = this;
      this.element = document.createElement('img');
      this.element.width = this.width;
      this.element.height = this.height;
      this.element.src = this.path;
      this.element.onload = function() {
        console.log("Loaded " + self.path);
        if (typeof self.onLoadCallback === "function") self.onLoadCallback();
        return self.isLoaded = true;
      };
      return this.element.onerror = function() {
        return raise(new Error("Could not load image " + self.path + "!"));
      };
    },
    onLoad: function(fn) {
      return this.onLoadCallback = fn;
    },
    clear: function(ctx, x, y) {
      return ctx.clearRect(x, y, this.width, this.height);
    },
    draw: function(ctx, x, y) {
      return ctx.drawImage(this.element, x, y);
    }
  });

  game.Image = Image;

  window.scriptLoaded('app/image');

}).call(this);

(function() {
  var Image, add, game, images, isLoaded, load, meta, numImages, numLoaded;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Image = game.Image;

  images = {};

  numImages = 0;

  numLoaded = 0;

  add = function(path, width, height) {
    var img;
    img = images[path] = Image.create(path, width, height);
    img.onLoad(function() {
      return numLoaded++;
    });
    return numImages++;
  };

  load = function() {
    var img, path, _results;
    _results = [];
    for (path in images) {
      img = images[path];
      _results.push(img.load());
    }
    return _results;
  };

  isLoaded = function() {
    return numLoaded === numImages;
  };

  add('8stone', 32, 32);

  add('dirt1', 16, 16);

  add('dirt2', 16, 16);

  add('dirt3', 16, 16);

  add('entrance_skull', 32, 16);

  add('flower', 48, 16);

  add('grass_dirt_edge01', 16, 16);

  add('grass_dirt_edge02', 16, 16);

  add('grass_dirt_edge03', 16, 16);

  add('grass_dirt_edge04', 16, 16);

  add('grass_dirt_edge05', 16, 16);

  add('grass_dirt_edge06', 16, 16);

  add('grass_dirt_edge07', 16, 16);

  add('grass_dirt_edge08', 16, 16);

  add('grass_dirt_edge09', 16, 16);

  add('grass_dirt_edge10', 16, 16);

  add('grass_dirt_edge11', 16, 16);

  add('grass_dirt_edge12', 16, 16);

  add('grass_dirt_edge13', 16, 16);

  add('grass_dirt_edge14', 16, 16);

  add('grass1', 16, 16);

  add('grass2', 16, 16);

  add('hill_e', 48, 32);

  add('hill_n', 32, 32);

  add('hill_ne1', 16, 32);

  add('hill_ne2', 32, 16);

  add('hill_nw1', 16, 32);

  add('hill_nw2', 32, 16);

  add('hill_s', 32, 80);

  add('hill_se1', 16, 80);

  add('hill_se2', 16, 64);

  add('hill_se3', 16, 64);

  add('hill_se4', 16, 32);

  add('hill_sw1', 16, 80);

  add('hill_sw2', 16, 64);

  add('hill_sw3', 16, 64);

  add('hill_sw4', 16, 32);

  add('hill_w', 48, 16);

  add('links_door_closed', 32, 32);

  add('links_house', 208, 200);

  add('post1', 16, 32);

  add('post2', 16, 32);

  add('post3', 16, 32);

  add('rock1', 16, 16);

  add('rock2', 16, 16);

  add('link2x', 34, 1440);

  game.imageCollection = {
    get: function(name) {
      return images[name] || (function() {
        throw new Error("Couldn't find image " + name + "!");
      })();
    },
    load: load,
    isLoaded: isLoaded
  };

  window.scriptLoaded('app/image_collection');

}).call(this);

(function() {
  var ImageSequence, add, game, imageCollection, sprites;

  game = (window.game || (window.game = {}));

  ImageSequence = game.ImageSequence;

  imageCollection = game.imageCollection;

  sprites = {};

  add = function(imagePath, width, height, frameIndices, opts) {
    if (opts == null) opts = {};
    return sprites[imagePath] = ImageSequence.create(imageCollection.get(imagePath), width, height, frameIndices, opts);
  };

  add('flower', 16, 16, [2, 0, 1], {
    frameDuration: 6,
    doesRepeat: true
  });

  game.spriteCollection = {
    get: function(name) {
      return sprites[name];
    }
  };

  window.scriptLoaded('app/sprite_collection');

}).call(this);

(function() {
  var game, maps;

  game = (window.game || (window.game = {}));

  maps = {};

  game.mapCollection = {
    get: function(name) {
      return maps[name];
    },
    add: function(name, width, height, fn) {
      return maps[name] = game.Map.create(name, width, height, fn);
    }
  };

  window.scriptLoaded('app/map_collection');

}).call(this);

(function() {
  var Background, SortedObjectMatrix, assignable, game, meta, tickable, _ref,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, tickable = _ref.tickable;

  SortedObjectMatrix = game.SortedObjectMatrix;

  Background = meta.def('game.Background', assignable, tickable, {
    init: function(map, width, height) {
      this.map = map;
      this.width = width;
      this.height = height;
      this.fills = [];
      this.tiles = [];
      this.sprites = game.SortedObjectMatrix.create();
      return this.framedSprites = this.sprites.clone().extend(game.FramedObjectMatrix);
    },
    assignToViewport: function(viewport) {
      this.viewport = viewport;
      return this.framedSprites.frameWithin(this.viewport.bounds);
    },
    fill: function(color, pos, dims) {
      return this.fills.push([color, pos, dims]);
    },
    addTile: function() {
      var opts, positions, proto, self;
      proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      self = this;
      opts = {};
      if ($.v.is.obj(positions[positions.length - 1])) opts = positions.pop();
      return $.v.each(positions, function(_arg) {
        var object, tile, x, y;
        x = _arg[0], y = _arg[1];
        object = proto.clone().extend(opts);
        tile = game.MapTile.create(object).assignToMap(this);
        tile.setMapPosition(x, y);
        self.tiles.push(tile);
        if (game.ImageSequence.isPrototypeOf(proto)) {
          return self.sprites.push(tile);
        }
      });
    },
    load: function() {
      var color, ctx, height, tile, width, x1, y1, _i, _j, _len, _len2, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
      this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('background');
      ctx = this.$canvas[0].getContext('2d');
      _ref2 = this.fills;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], color = _ref3[0], (_ref4 = _ref3[1], x1 = _ref4[0], y1 = _ref4[1]), (_ref5 = _ref3[2], width = _ref5[0], height = _ref5[1]);
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1, width, height);
      }
      _ref6 = this.tiles;
      _results = [];
      for (_j = 0, _len2 = _ref6.length; _j < _len2; _j++) {
        tile = _ref6[_j];
        _results.push(tile.draw(ctx));
      }
      return _results;
    },
    unload: function() {
      this.$canvas = null;
      return this.ctx = null;
    },
    attachTo: function(viewport) {
      this.viewport = viewport;
      this.viewport.getElement().append(this.$canvas);
      return this.ctx = this.$canvas[0].getContext('2d');
    },
    detach: function() {
      return this.$canvas.detach();
    },
    tick: function() {
      var self;
      self = this;
      this.$canvas.css({
        top: -this.viewport.bounds.y1,
        left: -this.viewport.bounds.x1
      });
      return this.framedSprites.each(function(sprite) {
        return sprite.draw(self.ctx);
      });
    }
  });

  Background.add = Background.addTile;

  game.Background = Background;

  window.scriptLoaded('app/background');

}).call(this);

(function() {
  var Foreground, assignable, game, meta, tickable, _ref,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, tickable = _ref.tickable;

  Foreground = meta.def('game.Foreground', assignable, tickable, {
    init: function(map, width, height) {
      this.map = map;
      this.width = width;
      this.height = height;
      this.objects = game.CollidableMatrix.create(this);
      this.framedObjects = this.objects.clone().extend(game.FramedObjectMatrix);
      this.blocks = [];
      this.player = null;
      return this.enableCollisions = true;
    },
    assignToViewport: function(viewport) {
      this.viewport = viewport;
      return this.framedObjects.frameWithin(this.viewport.bounds);
    },
    addObject: function() {
      var positions, proto, self;
      proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      self = this;
      return $.v.each(positions, function(_arg) {
        var height, object, width, x, y;
        x = _arg[0], y = _arg[1], width = _arg[2], height = _arg[3];
        object = proto.clone().assignToMap(self);
        object.setMapPosition(x, y);
        return self.objects.push(object);
      });
    },
    removeObject: function(object) {
      return this.objects.remove(object);
    },
    addPlayer: function(player) {
      this.player = player;
      this.player.assignToMap(this);
      return this.objects.add(this.player);
    },
    removePlayer: function() {
      return this.removeObject(this.player);
    },
    onLoad: function(onLoadCallback) {
      this.onLoadCallback = onLoadCallback;
    },
    load: function() {
      var _ref2;
      this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('foreground');
      return (_ref2 = this.onLoadCallback) != null ? _ref2.call(this) : void 0;
    },
    unload: function() {
      this.$canvas = null;
      return this.ctx = null;
    },
    activate: function() {
      return this.objects.each(function(object) {
        return typeof object.activate === "function" ? object.activate() : void 0;
      });
    },
    deactivate: function() {
      return this.objects.each(function(object) {
        return typeof object.deactivate === "function" ? object.deactivate() : void 0;
      });
    },
    attachTo: function(viewport) {
      this.viewport = viewport;
      this.viewport.getElement().append(this.$canvas);
      return this.ctx = this.$canvas[0].getContext('2d');
    },
    detach: function() {
      return this.$canvas.detach();
    },
    tick: function() {
      var self;
      self = this;
      this.$canvas.css({
        top: -this.viewport.bounds.y1,
        left: -this.viewport.bounds.x1
      });
      this.framedObjects.each(function(object) {
        return typeof object.predraw === "function" ? object.predraw(self.ctx) : void 0;
      });
      this.framedObjects.each(function(object) {
        return typeof object.draw === "function" ? object.draw(self.ctx) : void 0;
      });
      return this.framedObjects.each(function(object) {
        return typeof object.postdraw === "function" ? object.postdraw(self.ctx) : void 0;
      });
    },
    getObjectsWithout: function(object) {
      var coll;
      coll = this.enableCollisions ? this.framedObjects.clone() : game.CollidableMatrix.create(this);
      coll.extend(game.FilteredObjectMatrix).without(object);
      return coll;
    }
  });

  Foreground.add = Foreground.addObject;

  Foreground.remove = Foreground.removeObject;

  game.Foreground = Foreground;

  window.scriptLoaded('app/foreground');

}).call(this);

(function() {
  var Map, game, meta, tickable;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  tickable = game.roles.tickable;

  Map = meta.def('game.Map', tickable, {
    init: function(name, width, height, fn) {
      var bg, fg;
      this.name = name;
      this.width = width;
      this.height = height;
      fg = game.Foreground.create(this, this.width, this.height);
      bg = game.Background.create(this, this.width, this.height);
      fn(fg, bg);
      this.foreground = fg;
      this.background = bg;
      this.up = this.down = this.left = this.right = null;
      return this.isActive = false;
    },
    assignTo: function(viewport) {
      this.viewport = viewport;
      this.foreground.assignToViewport(this.viewport);
      return this.background.assignToViewport(this.viewport);
    },
    addPlayer: function(player) {
      this.player = player;
      return this.foreground.addPlayer(player);
    },
    load: function() {
      this.foreground.load();
      return this.background.load();
    },
    unload: function() {
      this.foreground.unload();
      return this.background.unload();
    },
    attachToViewport: function() {
      this.foreground.attachTo(this.viewport);
      this.background.attachTo(this.viewport);
      return this;
    },
    detachFromViewport: function() {
      this.foreground.detach();
      this.background.detach();
      return this;
    },
    activate: function() {
      this.isActive = true;
      return this.foreground.activate();
    },
    deactivate: function() {
      this.isActive = false;
      return this.player.removeEvents();
    },
    tick: function() {
      if (this.isActive) {
        this.background.tick();
        return this.foreground.tick();
      }
    },
    connectsUpTo: function(other) {
      return this.up = other;
    },
    connectsDownTo: function(other) {
      return this.down = other;
    },
    connectsLeftTo: function(other) {
      return this.left = other;
    },
    connectsRightTo: function(other) {
      return this.right = other;
    }
  });

  game.Map = Map;

  window.scriptLoaded('app/map');

}).call(this);

(function() {
  var MapTile, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  MapTile = meta.def('game.MapTile', assignable, simpleDrawable, {
    init: function(drawable) {
      this.drawable = drawable;
      return this.mbounds = game.Bounds.rect(0, 0, this.drawable.width, this.drawable.height);
    },
    setMapPosition: function(x, y) {
      return this.mbounds.anchor(x, y);
    },
    assignToMap: function(map) {
      this._super(map);
      this.map = map;
      this.drawable.assignTo(this);
      return this;
    },
    draw: function(ctx) {
      return this.drawable.draw(ctx, this.mbounds.x1, this.mbounds.y1);
    }
  });

  game.MapTile = MapTile;

  window.scriptLoaded('app/map_tile');

}).call(this);

(function() {
  var Block, game, imageCollection, img, mapCollection, spr, spriteCollection;

  game = (window.game || (window.game = {}));

  mapCollection = game.mapCollection;

  imageCollection = game.imageCollection;

  spriteCollection = game.spriteCollection;

  Block = game.Block;

  spr = spriteCollection.get;

  img = imageCollection.get;

  mapCollection.add('lw_52', 1024, 1024, function(fg, bg) {
    var eightStone;
    bg.fill('#48a048', [0, 0], [1024, 1024]);
    bg.fill('#3860b0', [944, 0], [80, 688]);
    bg.fill('#3860b0', [832, 96], [112, 496]);
    bg.add(spr('flower'), [160, 608], [320, 320], [336, 336], [352, 160], [352, 320], [368, 176], [384, 32], [384, 128], [384, 160], [400, 176], [400, 144], [480, 928], [704, 320], [720, 336], [736, 288], [736, 320], [768, 512], [784, 528], [800, 32], [800, 512]);
    bg.add(img('links_house'), [288, 352]);
    bg.add(img('links_door_closed'), [368, 512]);
    bg.add(img('entrance_skull'), [352, 560], [368, 544], [384, 560]);
    bg.add(img('grass1'), [0, 544], [32, 608], [128, 592], [160, 624], [224, 512], [256, 336], [256, 352], [256, 480], [272, 320], [272, 368], [288, 144], [288, 320], [304, 338], [320, 176], [320, 336], [352, 16], [352, 128], [352, 176], [352, 336], [368, 144], [384, 48], [384, 144], [384, 176], [448, 912], [480, 944], [512, 480], [704, 272], [704, 336], [704, 352], [704, 432], [720, 368], [736, 304], [736, 336], [736, 352], [736, 400], [752, 368], [768, 16], [768, 496], [768, 528], [768, 544], [768, 592], [784, 560], [800, 48], [800, 464], [800, 528], [800, 544], [800, 624], [816, 560]);
    bg.add(img('grass2'), [16, 544], [48, 608], [144, 592], [176, 624], [240, 512], [272, 336], [272, 352], [272, 480], [288, 336], [304, 144], [304, 320], [336, 176], [336, 320], [352, 144], [368, 128], [368, 160], [368, 336], [368, 16], [400, 48], [400, 128], [400, 160], [464, 912], [496, 944], [528, 480], [704, 368], [720, 272], [720, 320], [720, 352], [720, 432], [736, 368], [752, 304], [752, 336], [752, 352], [752, 400], [768, 560], [784, 16], [784, 496], [784, 512], [784, 544], [784, 592], [800, 560], [816, 48], [816, 464], [816, 528], [816, 544], [816, 624]);
    eightStone = game.StillObject.create('8stone', 32, 32);
    fg.add(Block.create(192, 176), [288, 352]);
    fg.add(eightStone, [256, 640]);
    return fg.onLoad(function() {
      return this.player.setMapPosition(368, 592);
    });
  });

  window.scriptLoaded('app/maps/lw_52');

}).call(this);

(function() {
  var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, LiveObject, dir, eventable, game, keyCode, keyboard, player, util, _i, _j, _len, _len2, _ref;

  game = (window.game || (window.game = {}));

  util = game.util;

  eventable = game.roles.eventable;

  keyboard = game.keyboard;

  LiveObject = game.LiveObject;

  DIRECTIONS = 'up down left right'.split(' ');

  DIRECTION_KEYS = {
    up: keyboard.keyCodesFor('KEY_W', 'KEY_UP'),
    down: keyboard.keyCodesFor('KEY_S', 'KEY_DOWN'),
    left: keyboard.keyCodesFor('KEY_A', 'KEY_LEFT'),
    right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT')
  };

  KEY_DIRECTIONS = {};

  for (_i = 0, _len = DIRECTIONS.length; _i < _len; _i++) {
    dir = DIRECTIONS[_i];
    _ref = DIRECTION_KEYS[dir];
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      keyCode = _ref[_j];
      KEY_DIRECTIONS[keyCode] = dir;
    }
  }

  KEYS = $.flatten($.values(DIRECTION_KEYS));

  player = LiveObject.cloneAs('game.player');

  player.extend(eventable, {
    viewportPadding: 30,
    keyTracker: keyboard.KeyTracker.create(KEYS),
    addEvents: function() {
      return keyboard.addKeyTracker(this.keyTracker);
    },
    removeEvents: function() {
      return keyboard.removeKeyTracker(this.keyTracker);
    },
    activate: function() {
      this.setState('idleRight');
      return this.addEvents();
    },
    deactivate: function() {
      return this.removeEvents();
    },
    predraw: function(ctx) {
      var direction, state;
      this._super(ctx);
      if (keyCode = this.keyTracker.getLastPressedKey()) {
        direction = KEY_DIRECTIONS[keyCode];
        state = 'move' + util.capitalize(direction);
      } else {
        state = this.currentState.name.replace('move', 'idle');
      }
      if (state !== this.currentState.name) return this.setState(state);
    },
    moveLeft: function() {
      var map, nextBoundsOnMap, x, _base;
      nextBoundsOnMap = this.mbounds.withTranslation({
        x: -this.speed
      });
      if (x = this.mapCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) {
        this.doToMapBounds('translateBySide', 'x1', x);
        return;
      }
      if ((this.viewport.bounds.x1 - this.speed) < 0) {
        if (map = typeof (_base = this.map).getAreaLeft === "function" ? _base.getAreaLeft() : void 0) {
          return this.map.loadArea(map);
        } else {
          this.viewport.translateBySide('x1', 0);
          if (nextBoundsOnMap.x1 < 0) {
            return this.doToMapBounds('translateBySide', 'x1', 0);
          } else {
            return this.doToMapBounds('replace', nextBoundsOnMap);
          }
        }
      } else {
        this.doToMapBounds('replace', nextBoundsOnMap);
        if ((this.vbounds.x1 - this.speed) < this.fence.x1) {
          return this.viewport.translateBySide('x1', this.mbounds.x1 - this.viewportPadding);
        }
      }
    },
    moveRight: function() {
      var map, mapWidth, nextBoundsOnMap, x, _base;
      nextBoundsOnMap = this.mbounds.withTranslation({
        x: +this.speed
      });
      if (x = this.mapCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) {
        this.doToMapBounds('translateBySide', 'x2', x);
        return;
      }
      mapWidth = this.map.width;
      if ((this.viewport.bounds.x2 + this.speed) > mapWidth) {
        if (map = typeof (_base = this.map).getAreaRight === "function" ? _base.getAreaRight() : void 0) {
          return this.map.loadArea(map);
        } else {
          this.viewport.translateBySide('x2', mapWidth);
          if (nextBoundsOnMap.x2 > mapWidth) {
            return this.doToMapBounds('translateBySide', 'x2', mapWidth);
          } else {
            return this.doToMapBounds('replace', nextBoundsOnMap);
          }
        }
      } else {
        this.doToMapBounds('replace', nextBoundsOnMap);
        if ((this.vbounds.x2 + this.speed) > this.fence.x2) {
          return this.viewport.translateBySide('x2', this.mbounds.x2 + this.viewportPadding);
        }
      }
    },
    moveUp: function() {
      var map, nextBoundsOnMap, y, _base;
      nextBoundsOnMap = this.mbounds.withTranslation({
        y: -this.speed
      });
      if (y = this.mapCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) {
        this.doToMapBounds('translateBySide', 'y1', y);
        return;
      }
      if ((this.viewport.bounds.y1 - this.speed) < 0) {
        if (map = typeof (_base = this.map).getAreaUp === "function" ? _base.getAreaUp() : void 0) {
          return this.map.loadArea(map);
        } else {
          this.viewport.translateBySide('y1', 0);
          if (nextBoundsOnMap.y1 < 0) {
            return this.doToMapBounds('translateBySide', 'y1', 0);
          } else {
            return this.doToMapBounds('replace', nextBoundsOnMap);
          }
        }
      } else {
        this.doToMapBounds('replace', nextBoundsOnMap);
        if ((this.vbounds.y1 - this.speed) < this.fence.y1) {
          return this.viewport.translateBySide('y1', this.mbounds.y1 - this.viewportPadding);
        }
      }
    },
    moveDown: function() {
      var map, mapHeight, nextBoundsOnMap, y, _base;
      nextBoundsOnMap = this.mbounds.withTranslation({
        y: this.speed
      });
      if (y = this.mapCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) {
        this.translateBySide('y2', y);
        return;
      }
      mapHeight = this.map.height;
      if ((this.viewport.bounds.y2 + this.speed) > mapHeight) {
        if (map = typeof (_base = this.map).getAreaDown === "function" ? _base.getAreaDown() : void 0) {
          return this.map.loadArea(map);
        } else {
          this.viewport.translateBySide('y2', mapHeight);
          if (nextBoundsOnMap.y2 > mapHeight) {
            return this.doToMapBounds('translateBySide', 'y2', mapHeight);
          } else {
            return this.doToMapBounds('replace', nextBoundsOnMap);
          }
        }
      } else {
        this.doToMapBounds('replace', nextBoundsOnMap);
        if ((this.vbounds.y2 + this.speed) > this.fence.y2) {
          return this.viewport.translateBySide('y2', this.mbounds.y2 + this.viewportPadding);
        }
      }
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(0, 0, game.viewport.width, game.viewport.height).withScale(this.viewportPadding);
    }
  });

  player.init('link2x', 34, 48);

  player.speed = 4;

  player.addState('moveLeft', [0, 1, 2, 3, 4, 5, 6, 7], {
    frameDuration: 2,
    doesRepeat: true,
    "do": 'moveLeft'
  });

  player.addState('moveRight', [8, 9, 10, 11, 12, 13, 14, 15], {
    frameDuration: 2,
    doesRepeat: true,
    "do": 'moveRight'
  });

  player.addState('moveDown', [16, 17, 18, 19, 20, 21, 22], {
    frameDuration: 2,
    doesRepeat: true,
    "do": 'moveDown'
  });

  player.addState('moveUp', [23, 24, 25, 26, 27, 28], {
    frameDuration: 2,
    doesRepeat: true,
    "do": 'moveUp'
  });

  player.addState('idleLeft', [0], {
    frameDuration: 2,
    doesRepeat: true
  });

  player.addState('idleRight', [8], {
    frameDuration: 2,
    doesRepeat: true
  });

  player.addState('idleDown', [19], {
    frameDuration: 2,
    doesRepeat: true
  });

  player.addState('idleUp', [23], {
    frameDuration: 2,
    doesRepeat: true
  });

  game.player = player;

  window.scriptLoaded('app/player');

}).call(this);

(function() {
  var fn, game, i, main, timer;

  game = (window.game || (window.game = {}));

  main = game.main;

  timer = null;

  i = 0;

  fn = function() {
    var numScripts, numScriptsLoaded, unfoundScripts;
    if (i === 20) {
      unfoundScripts = [];
      $.v.each(window.scripts, function(name) {
        if (window.scriptsLoaded.indexOf(name) === -1) {
          return unfoundScripts.push(name);
        }
      });
      console.log("Not all scripts were loaded! See: " + (unfoundScripts.join(", ")));
      window.clearTimeout(timer);
      timer = null;
      return;
    }
    i++;
    console.log("Checking to see if all scripts have been loaded...");
    numScripts = window.scripts.length;
    numScriptsLoaded = window.scriptsLoaded.length;
    if (numScripts === numScriptsLoaded) {
      console.log("Yup, looks like all scripts are loaded now.");
      window.clearTimeout(timer);
      timer = null;
      return main.init();
    } else {
      return timer = window.setTimeout(fn, 100);
    }
  };

  fn();

  window.scriptLoaded('app/init');

}).call(this);
