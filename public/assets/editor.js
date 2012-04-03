(function() {

  define('common', function() {
    return {
      imagesPath: '/images',
      resolveImagePath: function(path) {
        return "" + this.imagesPath + "/" + path;
      }
    };
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  define('util', function() {
    var arrayDelete, capitalize, clone, cmp, createFromProto, dup, ensureArray, extend, hashWithout, isPlainObject, randomInt, randomItem;
    extend = function() {
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
            target[prop] = clone(obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    };
    clone = function(obj) {
      if ($.v.is.arr(obj)) {
        return extend(true, [], obj);
      } else if (isPlainObject(obj)) {
        return extend(true, {}, obj);
      } else {
        return obj;
      }
    };
    dup = function(obj) {
      if ($.v.is.arr(obj)) {
        return extend(false, [], obj);
      } else if (isPlainObject(obj)) {
        return extend(false, {}, obj);
      } else {
        return obj;
      }
    };
    isPlainObject = function(obj) {
      return $.v.is.obj(obj) && obj.constructor === Object;
    };
    createFromProto = function(obj) {
      return Object.create(obj);
    };
    randomItem = function(arr) {
      return arr[randomInt(arr.length - 1)];
    };
    randomInt = function() {
      var args, max, min, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        _ref = [0, args[0]], min = _ref[0], max = _ref[1];
      } else {
        min = args[0], max = args[1];
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    capitalize = function(str) {
      return str[0].toUpperCase() + str.slice(1);
    };
    ensureArray = function(arr) {
      if (arr.length === 1 && $.is.arr(arr[0])) arr = arr[0];
      return arr;
    };
    arrayDelete = function(arr, item) {
      return arr.splice(item, 1);
    };
    cmp = function(a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    };
    hashWithout = function() {
      var hash, hash2, key, keys, _i, _len;
      hash = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      hash2 = dup(hash);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        delete hash2[key];
      }
      return hash2;
    };
    return {
      extend: extend,
      clone: clone,
      dup: dup,
      cmp: cmp,
      array: {
        "delete": arrayDelete,
        wrap: ensureArray,
        random: randomItem
      },
      int: {
        random: randomInt
      },
      string: {
        capitalize: capitalize
      },
      is: {
        hash: isPlainObject
      },
      hash: {
        is: isPlainObject,
        without: hashWithout
      },
      isPlainObject: isPlainObject,
      randomItem: randomItem,
      randomInt: randomInt,
      capitalize: capitalize,
      ensureArray: ensureArray,
      arrayDelete: arrayDelete,
      createFromProto: createFromProto
    };
  });

}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  define('meta', function() {
    var proto, _clone, _def, _extend, _fnContainsSuper, _wrap;
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
        value: require('util').dup(this.__mixins__),
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
    return {
      def: _def,
      extend: _extend,
      clone: _clone
    };
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('roles', function() {
    var ROLES, assignable, attachable, drawable, eventHelpers, eventable, loadable, meta, runnable, simpleDrawable, tickable, _getSafeNameFrom;
    meta = require('meta');
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
      getElement: function() {
        return this.$element;
      },
      setElement: function($element) {
        this.$element = $element;
        return this;
      },
      clearElement: function() {
        return this.$element = null;
      },
      getParentElement: function() {
        var parent;
        if (!this.$parentElement) {
          if (typeof this.getParent === 'function' && (parent = this.getParent())) {
            this.$parentElement = typeof parent.getElement === 'function' ? parent.getElement() : $(parent);
          }
        }
        return this.$parentElement;
      },
      setParentElement: function(element) {
        this.$parentElement = $(element);
        return this;
      },
      attach: function() {
        if (this.$element) this.getParentElement().append(this.$element);
        return this;
      },
      detach: function() {
        if (this.$element && this.$element[0] !== document.body) {
          this.$element.detach();
        }
        return this;
      }
    });
    attachable.willAttachTo = attachable.setParentElement;
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
      getParent: function() {
        return this.parent;
      },
      setParent: function(parent) {
        this.parent = parent;
        return this;
      }
    });
    assignable.assignTo = assignable.setParent;
    return {
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
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.keyboard', function() {
    var KEYS, KeyTracker, MODIFIER_KEYS, PressedKeys, eventable, keyboard, meta;
    meta = require('meta');
    eventable = require('roles').eventable;
    KEYS = {
      KEY_BACKSPACE: 8,
      KEY_TAB: 9,
      KEY_ESC: 27,
      KEY_DELETE: 46,
      KEY_SHIFT: 16,
      KEY_CTRL: 17,
      KEY_ALT: 18,
      KEY_META: 91,
      KEY_UP: 38,
      KEY_DOWN: 40,
      KEY_LEFT: 37,
      KEY_RIGHT: 39,
      KEY_1: 49,
      KEY_2: 50,
      KEY_W: 87,
      KEY_A: 65,
      KEY_S: 83,
      KEY_D: 68,
      KEY_F: 70
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
      getMostRecent: function() {
        return this.keys[0];
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
    KeyTracker = (function() {
      var KEY_TIMEOUT;
      KEY_TIMEOUT = 500;
      return meta.def({
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
          var keyCodes,
            _this = this;
          keyCodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return !!$.v.find(keyCodes, function(keyCode) {
            return _this.pressedKeys.has(keyCode);
          });
        },
        clearStuckKeys: function(now) {
          var _this = this;
          return this.pressedKeys.each(function(key, ts) {
            if ((now - ts) >= KEY_TIMEOUT) return _this.pressedKeys.del(key);
          });
        },
        getLastPressedKey: function() {
          return this.pressedKeys.getMostRecent();
        }
      });
    })();
    keyboard = meta.def(eventable, {
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
      isKeyPressed: function() {
        var evt, keys;
        evt = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return $.includes(this.keyCodesFor(keys), evt.keyCode);
      },
      isTrackedKeyPressed: function() {
        var keys,
          _this = this;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return !!$.v.find(this.keyTrackers, function(tracker) {
          return tracker.isKeyPressed(_this.keyCodesFor(keyCodes));
        });
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
        var key, keys, _i, _len, _ref, _results;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = $.flatten(keys);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          _results.push(this.keyCodeFor(key));
        }
        return _results;
      },
      keyCodeFor: function(key) {
        var givenKey, keyCode;
        givenKey = key;
        if (typeof key === 'string') {
          if (!/^KEY_/.test(key)) key = "KEY_" + (key.toUpperCase());
          keyCode = KEYS[key];
          if (!keyCode) {
            throw new Error("'" + givenKey + "' is not a known key. Known keys are: " + ($.v.keys(KEYS).join(", ")));
          }
          return keyCode;
        } else {
          return key;
        }
      }
    });
    keyboard.isKeyUnpressed = keyboard.isKeyPressed;
    return keyboard;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('editor.DragObject', function() {
    var DragObject, EVT_NS, dnd, enderMethods, meta;
    meta = require('meta');
    dnd = require('editor.dnd');
    EVT_NS = 'dnd.dragObject';
    DragObject = meta.def({
      init: function(elem, options) {
        var $dropTarget, that,
          _this = this;
        if (options == null) options = {};
        that = this;
        this.$elem = $(elem);
        this.$elem.addClass('editor-drag-object');
        this.offset = this.$elem.offset();
        this.options = options;
        if (options.dropTarget) {
          $dropTarget = $(options.dropTarget);
          this.dropTarget = $dropTarget.data('dropTarget');
          if (!this.dropTarget) {
            throw new Error("DragObject#init: Drop target not defined. Either the drop target doesn't exist, or you need to call $(...).dropTarget() on it.");
          }
        }
        this.dragOffset = null;
        return this.$elem.bind("mousedown." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'elem mousedown');
          if (evt.button === 2) return;
          evt.preventDefault();
          return _this._addWindowEvents();
        }).bind("mouseup." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'elem mouseup');
          if (!_this.dragStarted) return _this.$elem.trigger('mouseupnodrag', evt);
        }).bind("mousedragstart." + EVT_NS, function(evt) {
          var elemOffset;
          _this._logEvent(_this.$elem, 'elem mousedragstart');
          $(document.body).addClass('editor-drag-object-dragged');
          elemOffset = _this.$elem.offset();
          console.log("setting dragOffset on " + (_this.$elem.data('node-uid')));
          _this.dragOffset = {
            x: evt.pageX - elemOffset.left,
            y: evt.pageY - elemOffset.top
          };
          dnd.startDraggingWith(_this);
          if (_this.options.helper) {
            _this._addDragEventsWithHelper();
          } else {
            _this._addDragEventsWithoutHelper();
          }
          if (_this.dropTarget) {
            evt.relatedTarget = _this.$elem[0];
            _this.dropTarget.getSensor().trigger('dropopen', evt);
          }
          return _this.$elem.one("mousedragend." + EVT_NS, function(evt) {
            _this._logEvent(_this.$elem, 'elem mousedragend');
            $(document.body).removeClass('editor-drag-object-dragged');
            _this.dragOffset = null;
            if (_this.dropTarget) {
              evt.relatedTarget = _this.$elem[0];
              _this.dropTarget.getSensor().trigger('dropclose', evt);
            }
            dnd.stopDragging();
            if (_this.options.helper) {
              return _this._removeDragEventsWithHelper();
            } else {
              return _this._removeDragEventsWithoutHelper();
            }
          });
        });
      },
      destroy: function() {
        this.$elem.removeClass('editor-drag-object');
        this.$elem.unbind("." + EVT_NS);
        return $(window).unbind("." + EVT_NS);
      },
      position: function(evt) {
        var $elem, dropTargetOffset, x, y;
        $elem = this.options.helper ? this.$helper : this.$elem;
        if (!this.dragOffset) {
          console.log("accessing dragOffset on " + (this.$elem.data('node-uid')));
          throw new Error('dragOffset is not defined');
        }
        x = evt.pageX - this.dragOffset.x;
        y = evt.pageY - this.dragOffset.y;
        if (this.dropTarget) {
          dropTargetOffset = this.dropTarget.getReceptor().offset();
          if (this.isOverDropTarget) {
            x -= dropTargetOffset.left;
            y -= dropTargetOffset.top;
          }
          if (this.options.containWithinDropTarget) {
            if (x < 0) {
              x = 0;
            } else if ((x + this.offset.width) > dropTargetOffset.width) {
              x = dropTargetOffset.width - this.offset.width;
            }
            if (y < 0) {
              y = 0;
            } else if ((y + this.offset.height) > dropTargetOffset.height) {
              y = dropTargetOffset.height - this.offset.height;
            }
          }
        }
        return $elem.moveTo({
          x: x,
          y: y
        });
      },
      getDraggee: function() {
        if (this.options.helper) {
          return this.$helper;
        } else {
          return this.$elem;
        }
      },
      getElement: function() {
        return this.$elem;
      },
      getHelper: function() {
        return this.$helper;
      },
      setInsideDropTarget: function() {
        return this.isOverDropTarget = true;
      },
      setOutsideDropTarget: function() {
        return this.isOverDropTarget = false;
      },
      _addDragEventsWithHelper: function() {
        var _this = this;
        this.$helper = this.$elem.clone();
        this.$helper.addClass('editor-drag-helper');
        $(document.body).append(this.$helper);
        return this.$elem.one("mousedropcancel." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropcancel');
          _this.$helper.remove();
          return _this.$helper = null;
        }).bind("mousedropover." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropover');
          return _this.$helper.removeClass('editor-drag-helper').detach();
        }).bind("mousedropout." + EVT_NS, function(evt) {
          _this._logEvent(_this.$elem, 'helper mousedropout');
          _this.$helper.addClass('editor-drag-helper');
          $(document.body).append(_this.$helper);
          return _this.position(evt);
        }).bind("mousedrag." + EVT_NS, function(evt) {
          return _this.position(evt);
        });
      },
      _removeDragEventsWithHelper: function() {
        return this.$elem.unbind(["mousedropover." + EVT_NS, "mousedropout." + EVT_NS].join(" "));
      },
      _addDragEventsWithoutHelper: function() {
        var _this = this;
        return this.$elem.bind("mousedrag." + EVT_NS, function(evt) {
          return _this.position(evt);
        });
      },
      _removeDragEventsWithoutHelper: function() {
        return this.$elem.unbind("mousedrag." + EVT_NS);
      },
      _addWindowEvents: function() {
        var _this = this;
        console.log('addWindowEvents');
        this.dragStarted = false;
        this._addMousemoveEvent();
        return $(window).one("mouseup." + EVT_NS, function(evt) {
          _this._logEvent('window mouseup');
          if (_this.dragStarted) {
            _this.$elem.trigger('mousedragend', evt);
            if (!_this.isOverDropTarget) {
              _this.$elem.trigger('mousedropcancel', evt);
            }
          }
          return _this._removeWindowEvents();
        });
      },
      _addMousemoveEvent: function() {
        var _this = this;
        return $(window).bind("mousemove." + EVT_NS, function(evt) {
          if (!_this.dragStarted) {
            _this.dragStarted = true;
            _this.$elem.trigger("mousedragstart", evt);
          }
          if (_this.dragStarted) {
            return _this.$elem.trigger("mousedrag", evt);
          } else {
            return evt.preventDefault();
          }
        });
      },
      _removeMousemoveEvent: function() {
        return $(window).unbind("mousemove." + EVT_NS);
      },
      _removeWindowEvents: function() {
        console.log('removeWindowEvents');
        this.dragStarted = false;
        return $(window).unbind("." + EVT_NS);
      },
      _logEvent: function() {
        var $elem, args, desc, msg, name, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = args.reverse(), name = _ref[0], $elem = _ref[1];
        desc = this.options.helper ? 'map object' : 'helper';
        msg = "" + EVT_NS + ": " + name;
        if ($elem) msg += " (#" + ($elem.data('node-uid')) + ")";
        return console.log("" + msg + " (" + desc + ")");
      }
    });
    enderMethods = {
      dragObject: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.each(function() {
          var $this, dragObject, method, options;
          $this = $(this);
          dragObject = $this.data('dragObject');
          if (!dragObject) {
            options = args[0] || {};
            if (options && !$.v.is.obj(options)) {
              throw new Error("Usage: $(...).dragObject([options])");
            }
            dragObject = DragObject.create(this, options);
            $this.data('dragObject', dragObject);
          }
          if (typeof args[0] === 'string') {
            method = args[0];
            if (typeof dragObject[method] === 'function') {
              console.log("calling " + method + " on #" + ($this.data('node-uid')));
              dragObject[method](args.slice(1));
            }
            if (method === 'destroy') return $this.data('dragObject', null);
          }
        });
      }
    };
    $.ender(enderMethods, true);
    return DragObject;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('editor.DropTarget', function() {
    var DropTarget, EVT_NS, dnd, enderMethods, meta;
    meta = require('meta');
    dnd = require('editor.dnd');
    EVT_NS = 'dnd.dropTarget';
    DropTarget = meta.def({
      init: function(sensor, options) {
        var offset,
          _this = this;
        if (options == null) options = {};
        this.$sensor = $(sensor);
        this.options = options;
        this.$receptor = options.receptor ? $(options.receptor) : this.$sensor;
        if (!this.$sensor.length) {
          throw new Error("DropTarget#init: sensor element doesn't exist");
        }
        if (!this.$receptor.length) {
          throw new Error("DropTarget#init: receptor element doesn't exist");
        }
        offset = this.$sensor.offset();
        this.x1 = offset.left;
        this.x2 = offset.left + offset.width;
        this.y1 = offset.top;
        this.y2 = offset.top + offset.height;
        return this.$sensor.bind("dropopen." + EVT_NS, function(evt) {
          var $dragHelper, $dragOwner, $draggee, dragObject, lastMouseLocation, mouseenterFired, mouseleaveFired;
          _this._logEvent(_this.$sensor, 'sensor dropopen');
          $dragOwner = $(evt.relatedTarget);
          dragObject = $dragOwner.data('dragObject');
          $draggee = dragObject.getDraggee();
          $dragHelper = dragObject.getHelper();
          _this.$sensor.one("mouseup." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mouseup');
            evt.relatedTarget = $draggee[0];
            evt.relatedObject = dragObject;
            _this.$sensor.trigger("mousedropwithin", evt);
            return $dragOwner.trigger("mousedrop", evt);
          });
          if (_this._mouseWithinSensor(evt)) {
            dragObject.setInsideDropTarget();
            $(window).bind("mousemove." + EVT_NS, function(evt) {
              if (_this._mouseWithinSensor(evt)) {
                return _this.$sensor.trigger("mousedragwithin", evt);
              }
            });
            return;
          }
          lastMouseLocation = null;
          mouseenterFired = false;
          mouseleaveFired = false;
          dragObject.setOutsideDropTarget();
          $(window).bind("mousemove." + EVT_NS, function(evt) {
            if (_this._mouseWithinSensor(evt)) {
              if (lastMouseLocation === 'outside' && !mouseenterFired) {
                mouseenterFired = true;
                $dragOwner.trigger("mousedropover", evt);
                _this.$sensor.trigger("mousedragover", evt);
              }
              lastMouseLocation = 'inside';
              return _this.$sensor.trigger("mousedragwithin", evt);
            } else {
              if (lastMouseLocation === 'inside' && mouseenterFired && !mouseleaveFired) {
                mouseleaveFired = true;
                _this.$sensor.trigger("mousedragout", evt);
                $dragOwner.trigger("mousedropout", evt);
              }
              return lastMouseLocation = 'outside';
            }
          });
          return _this.$sensor.bind("mousedragover." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mousedragover');
            _this.$receptor.append($draggee);
            dragObject.setInsideDropTarget();
            return dragObject.position(evt);
          }).one("mousedragout." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'elem mousedragout');
            dragObject.setOutsideDropTarget();
            return $draggee.detach();
          }).one("dropclose." + EVT_NS, function(evt) {
            _this._logEvent(_this.$sensor, 'sensor dropclose');
            $(window).unbind("mousemove." + EVT_NS);
            return _this.$sensor.unbind("mousedragover." + EVT_NS);
          });
        });
      },
      destroy: function() {
        this.$sensor.unbind("." + EVT_NS);
        return $(window).unbind("." + EVT_NS);
      },
      getSensor: function() {
        return this.$sensor;
      },
      getReceptor: function() {
        return this.$receptor;
      },
      _mouseWithinSensor: function(evt) {
        var _ref, _ref2;
        return (this.x1 <= (_ref = evt.pageX) && _ref <= this.x2) && (this.y1 <= (_ref2 = evt.pageY) && _ref2 <= this.y2);
      },
      _logEvent: function() {
        var $elem, args, msg, name, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = args.reverse(), name = _ref[0], $elem = _ref[1];
        msg = "" + EVT_NS + ": " + name;
        if ($elem) msg += " (#" + ($elem.data('node-uid')) + ")";
        return console.log(msg);
      }
    });
    enderMethods = {
      dropTarget: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.each(function() {
          var $this, dropTarget, method, options;
          $this = $(this);
          dropTarget = $this.data('dropTarget');
          if (!dropTarget) {
            options = args[0] || {};
            if (options && !$.v.is.obj(options)) {
              throw new Error("Usage: $(...).dropTarget([options])");
            }
            dropTarget = DropTarget.create(this, options);
            $this.data('dropTarget', dropTarget);
          }
          if (typeof args[0] === 'string') {
            method = args.shift();
            if (typeof dropTarget[method] === 'function') {
              dropTarget[method].apply(dropTarget, args);
            }
            if (method === 'destroy') return $this.data('dropTarget', null);
          }
        });
      }
    };
    $.ender(enderMethods, true);
    return DropTarget;
  });

}).call(this);

(function() {

  define('editor.dnd', function() {
    return {
      startDraggingWith: function(dragObject) {
        this.dragObject = dragObject;
      },
      stopDragging: function() {
        return this.dragObject = null;
      }
    };
  });

}).call(this);

(function() {

  define('editor.core', function() {
    var LAYER_KEYS, LAYER_NAMES, keyboard, meta;
    meta = require('meta');
    keyboard = require('game.keyboard');
    require('editor.DragObject');
    LAYER_NAMES = ['fill', 'tiles'];
    LAYER_KEYS = [keyboard.keys.KEY_1, keyboard.keys.KEY_2];
    return meta.def({
      init: function() {
        var _this = this;
        this.keyboard = keyboard.init();
        this.viewport = require('editor.viewport').init(this);
        this.$sidebar = $('#editor-sidebar');
        this.$mapChooser = $('#editor-map-chooser select');
        this._resizeUI();
        $(window).resize(function() {
          return _this._resizeUI();
        });
        this._loadImages();
        this._whenImagesLoaded(function() {
          _this._populateMapObjects();
          _this._initLayers();
          _this._initToolbox();
          _this.viewport.loadMap();
          return _this._changeLayerTo(0);
        });
        return $(window).bind("keydown.editor.core", function(evt) {
          if (_this.keyboard.isKeyPressed(evt, 'backspace')) {
            return evt.preventDefault();
          }
        });
      },
      getLayers: function() {
        return LAYER_NAMES;
      },
      getCurrentLayer: function() {
        return this.currentLayer;
      },
      getCurrentLayerElem: function() {
        return this.findLayer(this.getCurrentLayer());
      },
      findLayer: function(layer) {
        return this.viewport.getMapLayers().find(".editor-layer[data-layer=" + layer + "]");
      },
      _resizeUI: function() {
        var h, nh, sw, wh, win, ww;
        win = $.viewport();
        wh = win.height;
        ww = win.width;
        nh = $('#editor-nav').offset().height;
        sw = this.$sidebar.offset().width;
        this.viewport.setWidth(ww - sw);
        h = wh - nh;
        this.viewport.setHeight(h);
        return this.$sidebar.height(h);
      },
      _loadImages: function() {
        return require('game.imageCollection').load();
      },
      _whenImagesLoaded: function(fn) {
        var check, imageCollection, t, timer;
        t = new Date();
        timer = null;
        imageCollection = require('game.imageCollection');
        check = function() {
          var t2;
          t2 = new Date();
          if ((t2 - t) > (10 * 1000)) {
            window.clearTimeout(timer);
            timer = null;
            console.log("Not all images were loaded!");
            return;
          }
          console.log("Checking to see if all images have been loaded...");
          if (imageCollection.isLoaded()) {
            console.log("Yup, looks like all images are loaded now.");
            window.clearTimeout(timer);
            timer = null;
            return fn();
          } else {
            return timer = window.setTimeout(check, 300);
          }
        };
        return check();
      },
      _populateMapObjects: function() {
        var imageCollection, spriteCollection,
          _this = this;
        imageCollection = require('game.imageCollection');
        spriteCollection = require('game.spriteCollection');
        this.objects = [];
        this.objectsByName = {};
        spriteCollection.each(function(sprite) {
          var dims, name, obj;
          name = sprite.name;
          if (_this.objectsByName[name]) return;
          dims = {
            w: sprite.width,
            h: sprite.height
          };
          obj = {
            name: name,
            dims: dims,
            object: sprite,
            image: sprite.image
          };
          _this.objects.push(obj);
          return _this.objectsByName[name] = obj;
        });
        imageCollection.each(function(image) {
          var dims, name, obj;
          name = image.name;
          if (name === 'link2x') return;
          if (_this.objectsByName[name]) return;
          dims = {
            w: image.width,
            h: image.height
          };
          obj = {
            name: name,
            dims: dims,
            object: image,
            image: image
          };
          _this.objects.push(obj);
          return _this.objectsByName[name] = obj;
        });
        this.objects = this.objects.sort(function(x1, x2) {
          var d1, d2, h1, h2, w1, w2, _ref, _ref2, _ref3;
          _ref = [x1.dims, x2.dims], d1 = _ref[0], d2 = _ref[1];
          _ref2 = [d1.w, d1.h].reverse(), w1 = _ref2[0], h1 = _ref2[1];
          _ref3 = [d2.w, d2.h].reverse(), w2 = _ref3[0], h2 = _ref3[1];
          if (w1 > w2) {
            return 1;
          } else if (w1 < w2) {
            return -1;
          } else if (h1 > h2) {
            return 1;
          } else if (h1 < h2) {
            return -1;
          } else {
            return 0;
          }
        });
        return $.v.each(this.objects, function(so) {
          var $elem;
          $elem = so.$elem = $("<div/>").addClass('img').data('name', so.object.name).width(so.dims.w).height(so.dims.h).append(so.image.getElement());
          return $elem.data('so', so);
        });
      },
      _populateSidebar: function() {
        var elems, evtns,
          _this = this;
        if (this.sidebarPopulated) return;
        elems = [];
        $.v.each(this.objects, function(so) {
          _this.$sidebar.find('> div[data-layer=tiles]').append(so.$elem);
          return elems.push(so.$elem[0]);
        });
        evtns = 'editor.core.sidebar';
        $(elems).dragObject({
          helper: true,
          dropTarget: this.viewport.getElement()
        }).bind("mousedragstart." + evtns, function(evt) {
          var $draggee, $helper, dragObject;
          console.log("" + evtns + ": mousedragstart");
          $draggee = $(this);
          dragObject = $draggee.data('dragObject');
          $helper = dragObject.getHelper();
          return $helper.addClass('editor-map-object');
        });
        return this.sidebarPopulated = true;
      },
      _initLayers: function() {
        var layer, that, _i, _len,
          _this = this;
        that = this;
        this.$layerChooser = $('#editor-layer-chooser select').change(function() {
          return that._selectLayer(this.value);
        });
        for (_i = 0, _len = LAYER_NAMES.length; _i < _len; _i++) {
          layer = LAYER_NAMES[_i];
          this.$sidebar.append("<div data-layer=\"" + layer + "\"></div>");
          this.$layerChooser.append("<option data-layer=\"" + layer + "\">" + layer + "</option>");
          this.viewport.addLayer(layer);
        }
        return $(window).bind('keyup', function(evt) {
          var index;
          index = LAYER_KEYS.indexOf(evt.keyCode);
          if (index !== -1) return _this._changeLayerTo(index);
        });
      },
      _changeLayerTo: function(index) {
        this.$layerChooser[0].selectedIndex = index;
        return this.$layerChooser.change();
      },
      _selectLayer: function(layer) {
        this._deactivateCurrentLayer();
        this.currentLayer = layer;
        return this._activateCurrentLayer();
      },
      _activateCurrentLayer: function() {
        var $layer, layer, m, _base;
        layer = this.currentLayer;
        $layer = this.viewport.$map.find(".editor-layer[data-layer=" + layer + "]").addClass('editor-layer-selected').detach();
        this.viewport.getMapLayers().append($layer);
        $(document.body).addClass("editor-layer-" + layer);
        this.$sidebar.find("> div[data-layer=" + layer + "]").show();
        m = "activate_" + layer + "_layer";
        console.log("viewport: activating " + layer + " layer");
        if (typeof (_base = this.viewport)[m] === "function") _base[m]();
        console.log("core: activating " + layer + " layer");
        if (typeof this[m] === "function") this[m]();
        return this._activateCurrentTool();
      },
      _deactivateCurrentLayer: function() {
        var layer, m, _base;
        layer = this.currentLayer;
        this.viewport.$map.find(".editor-layer[data-layer=" + layer).removeClass('editor-layer-selected');
        $(document.body).removeClass("editor-layer-" + layer);
        this.$sidebar.find("> div[data-layer=" + layer + "]").hide();
        m = "deactivate_" + layer + "_layer";
        if (layer) {
          if (this.currentTool) this._deactivateCurrentTool();
          console.log("core: deactivating " + layer + " layer");
          if (typeof this[m] === "function") this[m]();
          console.log("viewport: deactivating " + layer + " layer");
          return typeof (_base = this.viewport)[m] === "function" ? _base[m]() : void 0;
        }
      },
      _initToolbox: function() {
        var that;
        that = this;
        this.$toolbox = $('<div id="editor-toolbox"/>');
        this.viewport.getElement().append(this.$toolbox);
        this.currentTool = null;
        return this.prevTool = null;
      },
      _initTools: function(tools) {
        var evtns, that,
          _this = this;
        that = this;
        evtns = 'editor.core.tools';
        this._destroyTools();
        $.v.each(tools, function(tool) {
          var $tool;
          $tool = $("<img src=\"/images/editor/tool-" + tool + ".gif\" data-tool=\"" + tool + "\">");
          return _this.$toolbox.append($tool);
        });
        this.$toolbox.find('> img').bind("click." + evtns, function() {
          var tool;
          tool = $(this).data('tool');
          return that._selectTool(tool);
        });
        this.currentTool = 'normal';
        if ($.includes(tools, 'hand')) return this._initHandTool();
      },
      _destroyTools: function() {
        var evtns;
        evtns = 'editor.core.tools';
        this.$toolbox.find('> img').unbind('.' + evtns);
        this.$toolbox.html("");
        return $(window).unbind('.' + evtns);
      },
      _initHandTool: function() {
        var evtns, prevTool,
          _this = this;
        evtns = 'editor.core.tools';
        prevTool = null;
        return $(window).bind("keydown." + evtns, function(evt) {
          if (_this.keyboard.isKeyPressed(evt, 'shift')) {
            evt.preventDefault();
            prevTool = _this.currentTool;
            return _this._selectTool('hand');
          }
        }).bind("keyup." + evtns, function(evt) {
          if (_this.keyboard.isKeyUnpressed(evt, 'shift')) {
            _this._selectTool(prevTool);
            return prevTool = null;
          }
        });
      },
      _selectTool: function(tool) {
        this._deactivateCurrentTool();
        this.currentTool = tool;
        return this._activateCurrentTool();
      },
      _activateCurrentTool: function() {
        var $tool, m1, m2, _base, _base2;
        $tool = this.$toolbox.find("> [data-tool='" + this.currentTool + "']");
        $tool.addClass('editor-active');
        $(document.body).addClass("editor-tool-" + this.currentTool);
        m1 = "activate_" + this.currentTool + "_tool";
        m2 = "activate_" + this.currentLayer + "_" + this.currentTool + "_tool";
        console.log("viewport: activating " + this.currentTool + " tool");
        if (typeof (_base = this.viewport)[m1] === "function") _base[m1]();
        console.log("core: activating " + this.currentTool + " tool");
        if (typeof this[m1] === "function") this[m1]();
        console.log("viewport: activating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
        if (typeof (_base2 = this.viewport)[m2] === "function") _base2[m2]();
        console.log("core: activating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
        return typeof this[m2] === "function" ? this[m2]() : void 0;
      },
      _deactivateCurrentTool: function() {
        var $tool, m1, m2, _base, _base2;
        $tool = this.$toolbox.find("> [data-tool='" + this.currentTool + "']");
        $tool.removeClass('editor-active');
        $(document.body).removeClass("editor-tool-" + this.currentTool);
        m1 = "deactivate_" + this.currentTool + "_tool";
        m2 = "deactivate_" + this.currentLayer + "_" + this.currentTool + "_tool";
        if (this.currentTool) {
          if (this.currentLayer) {
            console.log("core: deactivating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
            if (typeof this[m2] === "function") this[m2]();
            console.log("viewport: deactivating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
            if (typeof (_base = this.viewport)[m2] === "function") _base[m2]();
          }
          console.log("core: deactivating " + this.currentTool + " tool");
          if (typeof this[m1] === "function") this[m1]();
          console.log("viewport: deactivating " + this.currentTool + " tool");
          return typeof (_base2 = this.viewport)[m1] === "function" ? _base2[m1]() : void 0;
        }
      },
      activate_fill_layer: function() {
        return this._initTools(['normal', 'hand', 'select']);
      },
      activate_tiles_layer: function() {
        return this._initTools(['normal', 'hand']);
      },
      activate_tiles_normal_tool: function() {
        return this._populateSidebar();
      }
    });
  });

}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define('editor.viewport', function() {
    var GRID_SIZE, meta, util;
    util = require('util');
    meta = require('meta');
    require('editor.DropTarget');
    GRID_SIZE = 16;
    return meta.def({
      init: function(core) {
        this.core = core;
        this.keyboard = this.core.keyboard;
        this.$elem = $('#editor-viewport');
        this.$map = $('#editor-map');
        this.$overlay = $('#editor-viewport-overlay');
        this._initMapGrid();
        this.$mapLayers = $('#editor-map-layers');
        this._initBounds();
        this.map = null;
        this.objectId = 0;
        this.objectsByLayer = $.v.reduce(this.core.getLayers(), (function(h, n) {
          h[n] = {};
          return h;
        }), {});
        return this;
      },
      getElement: function() {
        return this.$elem;
      },
      getMapLayers: function() {
        return this.$mapLayers;
      },
      getCurrentLayer: function() {
        return this.core.getCurrentLayer();
      },
      getElementForLayer: function(layer) {
        return this.$mapLayers.find(".editor-layer[data-layer=" + layer + "]");
      },
      getElementForCurrentLayer: function() {
        return this.getElementForLayer(this.getCurrentLayer());
      },
      getContentForLayer: function(layer) {
        return this.getElementForLayer(layer).find('.editor-layer-content');
      },
      getContentForCurrentLayer: function() {
        return this.getContentForLayer(this.getCurrentLayer());
      },
      setWidth: function(width) {
        this.$elem.width(width);
        return this.bounds.setWidth(width);
      },
      setHeight: function(height) {
        this.$elem.height(height);
        return this.bounds.setHeight(height);
      },
      addLayer: function(layer) {
        var $layer;
        $layer = $("<div class=\"editor-layer\" data-layer=\"" + layer + "\">\n  <div class=\"editor-layer-bg\"></div>\n  <div class=\"editor-layer-content\"></div>\n</div>");
        return this.$mapLayers.append($layer);
      },
      loadMap: function() {
        var data, fill, layer, layers, _i, _j, _len, _len2, _ref, _ref2, _results,
          _this = this;
        this.map = require('game.Bounds').rect(0, 0, 1024, 1024);
        this.$map.removeClass('editor-map-unloaded').size({
          w: this.map.width,
          h: this.map.height
        });
        if (data = localStorage.getItem('editor.map')) {
          console.log({
            'map data': data
          });
          try {
            layers = JSON.parse(data);
            _ref = ['tiles'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              layer = _ref[_i];
              $.v.each(layers[layer], function(o) {
                var $elem, object;
                object = _this.core.objectsByName[o.name];
                $elem = object.$elem.clone();
                $elem.addClass('editor-map-object');
                $elem.css('left', "" + o.x + "px");
                $elem.css('top', "" + o.y + "px");
                _this.core.findLayer(layer).find('.editor-layer-content').append($elem);
                return _this.addObject(layer, $elem, object);
              });
            }
            _ref2 = layers['fill'];
            _results = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              fill = _ref2[_j];
              _results.push(this._loadFill(fill));
            }
            return _results;
          } catch (e) {
            console.warn("Had a problem loading the map!");
            throw e;
          }
        }
      },
      activate_tiles_normal_tool: function() {
        var evtns, layerSel, mapObjectsSel, viewport,
          _this = this;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        viewport = this;
        layerSel = '#editor-map .editor-layer[data-layer=tiles]';
        mapObjectsSel = "" + layerSel + " .editor-map-object";
        this.$elem.dropTarget({
          receptor: "" + layerSel + " .editor-layer-content"
        }).bind("mousedropwithin." + evtns, function(evt) {
          var $dragOwner, $draggee, dragObject;
          console.log("" + evtns + ": mousedropwithin");
          dragObject = evt.relatedObject;
          $dragOwner = dragObject.getElement();
          $draggee = dragObject.getDraggee();
          if (!_this.objectExistsIn('tiles', $draggee)) {
            _this.addObject('tiles', $draggee, $dragOwner.data('so'));
            _this._addEventsToMapObjects($draggee);
          }
          $draggee.position(_this._roundCoordsToGrid($draggee.position()));
          return _this.saveMap();
        });
        this._addEventsToMapObjects($(mapObjectsSel));
        this.$map.bind("mousedown." + evtns, function(evt) {
          console.log("" + evtns + ": mouseup");
          _this.$map.find('.editor-map-object').removeClass('editor-selected');
          return _this.$map.find('.editor-map-object[data-is-selected=yes]').addClass('editor-selected').removeAttr('data-is-selected');
        });
        return $(window).bind("keyup." + evtns, function(evt) {
          var $selectedObjects;
          if (_this.keyboard.isKeyPressed(evt, 'backspace', 'delete')) {
            $selectedObjects = _this.$map.find('.editor-map-object.editor-selected');
            if ($selectedObjects.length) {
              $selectedObjects.each(function(elem) {
                var $elem, objectId;
                $elem = $(elem);
                objectId = $elem.data('moid');
                console.log("viewport: removing object " + objectId);
                delete _this.objectsByLayer[_this.core.getCurrentLayer()][objectId];
                return $elem.remove();
              });
              return _this.saveMap();
            }
          }
        });
      },
      deactivate_tiles_normal_tool: function() {
        var evtns, layerSel, mapObjectsSel;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        layerSel = '#editor-map .editor-layer[data-layer=tiles]';
        mapObjectsSel = "" + layerSel + " .editor-map-object";
        this.$elem.dropTarget('destroy').unbind("." + evtns);
        this._removeEventsFromMapObjects($(mapObjectsSel));
        this.$map.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      activate_hand_tool: function() {
        var dragActive, evtns,
          _this = this;
        evtns = 'editor.viewport.tool-hand';
        dragActive = false;
        return this.$elem.bind("mousedown." + evtns, function(evt) {
          var mouse;
          console.log('viewport: mousedown (hand tool)');
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          evt.preventDefault();
          $(window).bind("mousemove." + evtns, function(evt) {
            var dx, dy, h, mapX, mapY, w, x, y;
            if (!dragActive) {
              $(document.body).addClass('editor-drag-active');
              dragActive = true;
            }
            x = evt.pageX;
            y = evt.pageY;
            dx = x - mouse.px;
            dy = y - mouse.py;
            mapX = _this.map.x1 + dx;
            if (mapX > 0) mapX = 0;
            w = -(_this.map.width - _this.bounds.width);
            if (mapX < w) mapX = w;
            mapY = _this.map.y1 + dy;
            if (mapY > 0) mapY = 0;
            h = -(_this.map.height - _this.bounds.height);
            if (mapY < h) mapY = h;
            _this.$map.css("left", "" + mapX + "px");
            _this.$map.css("top", "" + mapY + "px");
            _this.map.anchor(mapX, mapY);
            mouse.px = x;
            mouse.py = y;
            return evt.preventDefault();
          });
          return $(window).one("mouseup." + evtns, function(evt) {
            $(document.body).removeClass('editor-drag-active');
            dragActive = false;
            mouse = null;
            return $(window).unbind("mousemove." + evtns);
          });
        });
      },
      deactivate_hand_tool: function() {
        var evtns;
        evtns = 'editor.viewport.tool-hand';
        this.$elem.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      activate_fill_normal_tool: function() {
        var $boxes, evtns,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-normal';
        this.$elem.dropTarget({
          receptor: this.getElementForCurrentLayer()
        }).bind("mousedropwithin." + evtns, function(evt) {
          var $draggee, fill;
          $draggee = $(evt.relatedTarget);
          fill = $draggee.data('fill');
          fill.position(_this._roundCoordsToGrid($draggee.position()));
          return _this.saveMap();
        });
        $boxes = this.getContentForCurrentLayer().find('.editor-fill');
        this._addEventsToSelectionBoxes($boxes);
        this.$elem.bind("mousedown." + evtns, function(evt) {
          var $layer;
          console.log("" + evtns + ": mousedown");
          $layer = _this.getContentForCurrentLayer();
          $layer.find('.editor-fill').removeClass('editor-selected');
          return $layer.find('.editor-fill[data-is-selected=yes]').addClass('editor-selected').removeAttr('data-is-selected');
        });
        return $(window).bind("keyup." + evtns, function(evt) {
          var $layerContent, $selectedObjects;
          if (_this.keyboard.isKeyPressed(evt, 'backspace', 'delete')) {
            $layerContent = _this.getContentForCurrentLayer();
            $selectedObjects = $layerContent.find('.editor-fill.editor-selected');
            if ($selectedObjects.length) {
              $selectedObjects.each(function(elem) {
                return _this._removeFill(elem);
              });
              return _this.saveMap();
            }
          }
        });
      },
      deactivate_fill_normal_tool: function() {
        var $boxes, evtns;
        evtns = 'editor.viewport.layer-fill.tool-normal';
        this.$elem.unbind("." + evtns);
        this.$elem.dropTarget('destroy');
        $boxes = this.getContentForCurrentLayer().find('.editor-fill');
        return this._removeEventsFromSelectionBoxes($boxes);
      },
      activate_fill_select_tool: function() {
        var activeSelections, adjustCoords, clearActiveSelections, currentSelection, dragStarted, evtns, mouseDownAt, selectionEvents,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-select';
        dragStarted = false;
        mouseDownAt = null;
        activeSelections = [];
        currentSelection = null;
        clearActiveSelections = function() {
          activeSelections = [];
          return _this.$overlay.find('.editor-selection-box').remove();
        };
        selectionEvents = (function() {
          var clearSelection, ex, mouseupBound;
          mouseupBound = false;
          clearSelection = function(evt) {
            console.log('clearing selection');
            evt.preventDefault();
            return clearActiveSelections();
          };
          ex = {};
          ex.add = function() {
            if (mouseupBound) return;
            console.log('binding mouseup');
            mouseupBound = true;
            return _this.$elem.bind("mouseup." + evtns, clearSelection);
          };
          ex.remove = function() {
            if (!mouseupBound) return;
            console.log('unbinding mouseup');
            mouseupBound = false;
            return _this.$elem.unbind(clearSelection);
          };
          return ex;
        })();
        adjustCoords = function(p) {
          return {
            x: p.x - _this.bounds.x1,
            y: p.y - _this.bounds.y1
          };
        };
        this.$elem.bind("contextmenu." + evtns, function(evt) {
          return evt.preventDefault();
        }).bind("mousedown." + evtns, function(evt) {
          var appendingNewSelection, selectionStartedAt;
          if (evt.button === 2 || (evt.ctrlKey && evt.button === 0)) return;
          evt.preventDefault();
          appendingNewSelection = evt.altKey;
          selectionStartedAt = _this._roundCoordsToGrid(adjustCoords({
            x: evt.pageX,
            y: evt.pageY
          }));
          return _this.$elem.bind("mousemove." + evtns, function(evt) {
            var $box, h, mouse, w, x, y;
            evt.preventDefault();
            if (!dragStarted) {
              dragStarted = true;
              if (!appendingNewSelection) clearActiveSelections();
              selectionEvents.remove();
              currentSelection = {};
              currentSelection.pos = selectionStartedAt;
              currentSelection.$box = $box = $('<div class="editor-selection-box">');
              _this.$overlay.append(currentSelection.$box);
            }
            mouse = _this._roundCoordsToGrid(adjustCoords({
              x: evt.pageX,
              y: evt.pageY
            }));
            if (mouse.x < currentSelection.pos.x) {
              x = mouse.x;
              w = currentSelection.pos.x - mouse.x;
            } else {
              x = currentSelection.pos.x;
              w = mouse.x - currentSelection.pos.x;
            }
            if (mouse.y < currentSelection.pos.y) {
              y = mouse.y;
              h = currentSelection.pos.y - mouse.y;
            } else {
              y = currentSelection.pos.y;
              h = mouse.y - currentSelection.pos.y;
            }
            $.extend(currentSelection, {
              x: x,
              y: y,
              w: w,
              h: h
            });
            if (w === 0 && h === 0) {
              return currentSelection.$box.hide();
            } else {
              return currentSelection.$box.show().moveTo({
                x: x,
                y: y
              }).size({
                w: w - 1,
                h: h - 1
              });
            }
          });
        }).delegate('.editor-selection-box', "mousedown." + evtns, function(evt) {
          console.log('selection box mousedown');
          evt.preventDefault();
          return selectionEvents.remove();
        }).delegate('.editor-selection-box', "mouseup." + evtns, function(evt) {
          console.log('selection box mouseup');
          evt.preventDefault();
          return setTimeout(selectionEvents.add, 0);
        });
        $(window).bind("mouseup." + evtns, function(evt) {
          _this.$elem.unbind("mousemove." + evtns);
          mouseDownAt = null;
          if (currentSelection && currentSelection.w > 0 && currentSelection.h > 0) {
            activeSelections.push(currentSelection);
          }
          currentSelection = null;
          dragStarted = false;
          return setTimeout(selectionEvents.add, 0);
        }).bind("keyup." + evtns, function(evt) {
          var Bounds;
          Bounds = require('game.Bounds');
          if (_this.keyboard.isKeyPressed(evt, 'F')) {
            $.v.each(activeSelections, function(sel) {
              var fill;
              fill = {
                x: sel.x,
                y: sel.y,
                w: sel.w,
                h: sel.h,
                color: '#800000'
              };
              return _this._loadFill(fill);
            });
            return _this.saveMap();
          }
        });
        return selectionEvents.add();
      },
      _addEventsToSelectionBoxes: function($boxes) {
        var evtns;
        evtns = 'editor.viewport.selection-box';
        return $boxes.dragObject({
          dropTarget: this.$elem,
          containWithinDropTarget: true
        }).bind("mousedown." + evtns, function(evt) {
          var $draggee, newstate, state;
          console.log('selection box mousedown (after creation)');
          $draggee = $(this);
          state = $draggee.attr('data-is-selected');
          newstate = state === 'no' || !state ? 'yes' : 'no';
          return $draggee.attr('data-is-selected', newstate);
        });
      },
      _removeEventsFromSelectionBoxes: function($boxes) {
        var evtns;
        evtns = 'editor.viewport.selection-box';
        return $boxes.dragObject('destroy').unbind("mouseupnodrag." + evtns).removeAttr('data-is-selected').removeClass('editor-selected');
      },
      deactivate_fill_select_tool: function() {
        var evtns;
        evtns = 'editor.viewport.layer-fill.tool-select';
        this.$elem.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      addObject: function(layer, $elem, object) {
        var k, obj, v, _name;
        console.log('viewport: addObject');
        obj = {};
        obj.moid = this.objectId;
        for (k in object) {
          if (!__hasProp.call(object, k)) continue;
          v = object[k];
          obj[k] = v;
        }
        obj.$elem = $elem;
        $elem.data('moid', this.objectId);
        console.log({
          adding: obj
        });
        this.objectsByLayer[layer][this.objectId] = obj;
        this.objectId++;
        return typeof this[_name = "_activate_" + layer + "_" + this.core.currentTool + "_tool_for_object"] === "function" ? this[_name](obj) : void 0;
      },
      objectExistsIn: function(layer, $elem) {
        var moid;
        moid = $elem.data('moid');
        return !!this.objectsByLayer[layer][moid];
      },
      _createFillElement: function(fill) {
        var $elem;
        $elem = $('<div class="editor-fill"></div>');
        $elem.position(fill.store);
        $elem.size(fill.store);
        $elem.css('background-color', fill.store.color);
        $elem.data('fill', fill);
        return $elem;
      },
      _createFill: function(store) {
        var $elem, fill;
        fill = {
          store: util.dup(store)
        };
        fill.position = function(pos) {
          if (pos) {
            this.$elem.position(pos);
            this.store.x = pos.x;
            this.store.y = pos.y;
            return this;
          } else {
            return {
              x: this.store.x,
              y: this.store.y
            };
          }
        };
        $elem = this._createFillElement(fill);
        fill.$elem = $elem;
        fill.moid = this.objectId;
        this.objectId++;
        return fill;
      },
      _addFill: function(fill) {
        return this.objectsByLayer['fill'][fill.moid] = fill;
      },
      _loadFill: function(fill) {
        var $content;
        fill = this._createFill(fill);
        $content = this.getContentForLayer('fill');
        if (!$content.length) {
          throw new Error("Can't add fill, couldn't find layer content element");
        }
        $content.append(fill.$elem);
        this._addFill(fill);
        return fill;
      },
      _removeFill: function(elem) {
        var $elem, fill;
        $elem = $(elem);
        fill = $elem.data('fill');
        console.log("viewport: removing fill " + fill.moid);
        delete this.objectsByLayer['fill'][fill.moid];
        return $elem.remove();
      },
      saveMap: function() {
        var id, layer, layers, object, pos, _i, _len, _ref, _ref2;
        console.log('viewport: saving map...');
        layers = {};
        _ref = ['tiles'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          layers[layer] = [];
          _ref2 = this.objectsByLayer[layer];
          for (id in _ref2) {
            object = _ref2[id];
            pos = object.$elem.position();
            layers[layer].push({
              name: object.name,
              x: pos.x,
              y: pos.y
            });
          }
        }
        layers['fill'] = $.v.map(this.objectsByLayer['fill'], function(moid, fill) {
          return fill.store;
        });
        return localStorage.setItem('editor.map', JSON.stringify(layers));
      },
      _initMapGrid: function() {
        var canvas, ctx, mapGrid;
        canvas = require('game.canvas').create(GRID_SIZE, GRID_SIZE);
        ctx = canvas.getContext();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(GRID_SIZE, 0.5);
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(0.5, GRID_SIZE);
        ctx.stroke();
        mapGrid = canvas;
        return this.$mapGrid = $('#editor-map-grid').css('background-image', "url(" + (mapGrid.element.toDataURL()) + ")").css('background-repeat', 'repeat');
      },
      _initBounds: function() {
        var offset;
        offset = this.$elem.offset();
        return this.bounds = require('game.Bounds').rect(offset.left, offset.top, offset.width, offset.height);
      },
      _addEventsToMapObjects: function($draggees) {
        var evtns;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        $draggees.bind("mousedown." + evtns, function(evt) {
          var $draggee, newstate, state;
          console.log("" + evtns + ": map object mouseupnodrag");
          $draggee = $(this);
          state = $draggee.attr('data-is-selected');
          newstate = state === 'no' || !state ? 'yes' : 'no';
          return $draggee.attr('data-is-selected', newstate);
        });
        return $draggees.dragObject({
          dropTarget: this.$elem,
          containWithinDropTarget: true
        });
      },
      _removeEventsFromMapObjects: function($draggees) {
        var evtns;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        return $draggees.dragObject('destroy').unbind("." + evtns);
      },
      _roundCoordsToGrid: function(p) {
        return {
          x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(p.y / GRID_SIZE) * GRID_SIZE
        };
      },
      _mouseWithinViewport: function(evt) {
        var _ref, _ref2;
        return (this.bounds.x1 <= (_ref = evt.pageX) && _ref <= this.bounds.x2) && (this.bounds.y1 <= (_ref2 = evt.pageY) && _ref2 <= this.bounds.y2);
      }
    });
  });

}).call(this);

(function() {

  define('editor', function() {
    return {
      init: function() {
        require('editor.dnd');
        return require('editor.core').init();
      }
    };
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.Background', function() {
    var Background, assignable, attachable, meta, tickable, _ref;
    meta = require('meta');
    _ref = require('roles'), attachable = _ref.attachable, assignable = _ref.assignable, tickable = _ref.tickable;
    Background = meta.def(attachable, assignable, tickable, {
      init: function(map, width, height) {
        this.map = map;
        this.width = width;
        this.height = height;
        this.fills = [];
        this.tiles = [];
        this.sprites = require('game.SortedObjectMatrix').create();
        return this.framedSprites = this.sprites.clone().extend(require('game.FramedObjectMatrix'));
      },
      setParent: function(parent) {
        this._super(parent);
        this.viewport = parent;
        return this.framedSprites.frameWithin(this.viewport.bounds);
      },
      attach: function() {
        this._super();
        return this.ctx = this.$canvas[0].getContext('2d');
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
      },
      fill: function(color, pos, dims) {
        return this.fills.push([color, pos, dims]);
      },
      addTile: function() {
        var ImageSequence, MapTile, opts, positions, proto, self;
        proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        self = this;
        opts = {};
        if ($.v.is.obj(positions[positions.length - 1])) opts = positions.pop();
        MapTile = require('game.MapTile');
        ImageSequence = require('game.ImageSequence');
        return $.v.each(positions, function(_arg) {
          var object, tile, x, y;
          x = _arg[0], y = _arg[1];
          object = proto.clone().extend(opts);
          tile = MapTile.create(object).assignToMap(this);
          tile.setMapPosition(x, y);
          self.tiles.push(tile);
          if (ImageSequence.isPrototypeOf(proto)) return self.sprites.push(tile);
        });
      },
      load: function() {
        var color, ctx, height, tile, width, x1, y1, _i, _j, _len, _len2, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
        this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('background');
        this.setElement(this.$canvas);
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
        this.clearElement();
        return this.ctx = null;
      }
    });
    Background.add = Background.addTile;
    return Background;
  });

}).call(this);

(function() {

  define('game.Block', function() {
    var Block, Collidable, Mappable, assignable, meta;
    meta = require('meta');
    assignable = require('roles').assignable;
    Mappable = require('game.Mappable');
    Collidable = require('game.Collidable');
    Block = meta.def(assignable, Mappable, Collidable, {
      _initCollidableBounds: function() {
        return this.cbounds = require('game.Bounds').rect(0, 0, this.width, this.height);
      }
    });
    return Block;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.Bounds', function() {
    var Bounds, meta, _boundsFrom;
    meta = require('meta');
    _boundsFrom = function(mappableOrBounds) {
      var _ref;
      return (_ref = mappableOrBounds.mbounds) != null ? _ref : mappableOrBounds;
    };
    Bounds = meta.def({
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
      setWidth: function(width) {
        this.width = width;
        return this.x2 = this.x1 + width;
      },
      setHeight: function(height) {
        this.height = height;
        return this.y2 = this.y1 + height;
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
    return Bounds;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.canvas', function() {
    var Pixel, canvas, contextExt, imageDataExt;
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
    return canvas;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.Collidable', function() {
    var Collidable, meta;
    meta = require('meta');
    Collidable = meta.def({
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
        return this.cbounds = require('game.Bounds').rect(0, 0, this.width, this.height - 8);
      },
      _initCollidables: function() {
        return this.mapCollidables = this.map.getObjectsWithout(this);
      }
    });
    return Collidable;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.Foreground', function() {
    var Foreground, assignable, attachable, meta, tickable, _ref;
    meta = require('meta');
    _ref = require('roles'), attachable = _ref.attachable, assignable = _ref.assignable, tickable = _ref.tickable;
    Foreground = meta.def('game.Foreground', attachable, assignable, tickable, {
      init: function(map, width, height) {
        this.map = map;
        this.width = width;
        this.height = height;
        this.objects = require('game.CollidableMatrix').create(this);
        this.framedObjects = this.objects.clone().extend(require('game.FramedObjectMatrix'));
        this.blocks = [];
        this.player = null;
        return this.enableCollisions = true;
      },
      setParent: function(parent) {
        this._super(parent);
        this.viewport = parent;
        return this.framedObjects.frameWithin(this.viewport.bounds);
      },
      attach: function() {
        this._super();
        return this.ctx = this.$canvas[0].getContext('2d');
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
        this.setElement(this.$canvas);
        return (_ref2 = this.onLoadCallback) != null ? _ref2.call(this) : void 0;
      },
      unload: function() {
        this.$canvas = null;
        this.clearElement();
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
      getObjectsWithout: function(object) {
        var coll;
        coll = this.enableCollisions ? this.framedObjects.clone() : require('game.CollidableMatrix').create(this);
        coll.extend(require('game.FilteredObjectMatrix')).without(object);
        return coll;
      }
    });
    Foreground.add = Foreground.addObject;
    Foreground.remove = Foreground.removeObject;
    return Foreground;
  });

}).call(this);

(function() {

  define('game.Image', function() {
    var Image, assignable, meta, simpleDrawable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;
    Image = meta.def(assignable, simpleDrawable, {
      init: function(name, path, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
        if (!/\.[^.]+$/.test(path)) path += ".gif";
        if (!/^\//.test(path)) path = require('common').resolveImagePath(path);
        this.path = path;
        return this.isLoaded = false;
      },
      getElement: function() {
        return this.element;
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
          throw new Error("Could not load image " + self.path + "!");
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
    return Image;
  });

}).call(this);

(function() {

  define('game.imageCollection', function() {
    var Image, add, addObject, addTile, each, get, images, isLoaded, load, meta, numImages, numLoaded;
    meta = require('meta');
    Image = require('game.Image');
    images = {};
    numImages = 0;
    numLoaded = 0;
    add = function(name, path, width, height) {
      var img;
      img = images[name] = Image.create(name, path, width, height);
      img.onLoad(function() {
        return numLoaded++;
      });
      return numImages++;
    };
    addTile = function(name, width, height) {
      return add(name, "game/tiles/" + name, width, height);
    };
    addObject = function(name, width, height) {
      return add(name, "game/objects/" + name, width, height);
    };
    get = function(name) {
      return images[name] || (function() {
        throw new Error("Couldn't find image " + name + "!");
      })();
    };
    load = function() {
      var img, name, _results;
      _results = [];
      for (name in images) {
        img = images[name];
        _results.push(img.load());
      }
      return _results;
    };
    isLoaded = function() {
      return numLoaded === numImages;
    };
    each = function(fn) {
      var names;
      names = $.v.keys(images).sort();
      return $.v.each(names, function(name) {
        return fn(images[name]);
      });
    };
    addTile('8stone', 32, 32);
    addTile('dirt1', 16, 16);
    addTile('dirt2', 16, 16);
    addTile('dirt3', 16, 16);
    addTile('entrance_skull', 32, 16);
    addTile('flower', 16, 48);
    addTile('grass_dirt_edge01', 16, 16);
    addTile('grass_dirt_edge02', 16, 16);
    addTile('grass_dirt_edge03', 16, 16);
    addTile('grass_dirt_edge04', 16, 16);
    addTile('grass_dirt_edge05', 16, 16);
    addTile('grass_dirt_edge06', 16, 16);
    addTile('grass_dirt_edge07', 16, 16);
    addTile('grass_dirt_edge08', 16, 16);
    addTile('grass_dirt_edge09', 16, 16);
    addTile('grass_dirt_edge10', 16, 16);
    addTile('grass_dirt_edge11', 16, 16);
    addTile('grass_dirt_edge12', 16, 16);
    addTile('grass_dirt_edge13', 16, 16);
    addTile('grass_dirt_edge14', 16, 16);
    addTile('grass1', 16, 16);
    addTile('grass2', 16, 16);
    addTile('hill_e', 48, 32);
    addTile('hill_n', 32, 32);
    addTile('hill_ne1', 16, 32);
    addTile('hill_ne2', 32, 16);
    addTile('hill_nw1', 16, 32);
    addTile('hill_nw2', 32, 16);
    addTile('hill_s', 32, 80);
    addTile('hill_se1', 16, 80);
    addTile('hill_se2', 16, 64);
    addTile('hill_se3', 16, 64);
    addTile('hill_se4', 16, 32);
    addTile('hill_sw1', 16, 80);
    addTile('hill_sw2', 16, 64);
    addTile('hill_sw3', 16, 64);
    addTile('hill_sw4', 16, 32);
    addTile('hill_w', 48, 16);
    addTile('links_door_closed', 32, 32);
    addTile('links_house', 208, 200);
    addTile('post1', 16, 32);
    addTile('post2', 16, 32);
    addTile('post3', 16, 32);
    addTile('rock1', 16, 16);
    addTile('rock2', 16, 16);
    addObject('link2x', 34, 1440);
    return {
      get: get,
      load: load,
      isLoaded: isLoaded,
      each: each
    };
  });

}).call(this);

(function() {

  define('game.ImageSequence', function() {
    var ImageSequence, assignable, meta, simpleDrawable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;
    ImageSequence = meta.def(assignable, simpleDrawable, {
      init: function(name, image, width, height, frameIndices, opts) {
        this.name = name;
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
    return ImageSequence;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.LiveObject', function() {
    var LiveObject, StillObject, meta;
    meta = require('meta');
    StillObject = require('game.StillObject');
    LiveObject = StillObject.cloneAs('game.LiveObject').extend({
      states: {},
      clone: function() {
        var clone;
        clone = this._super();
        clone.states = require('util').dup(clone.states);
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
        seq = require('game.ImageSequence').create(name, this.image, this.width, this.height, frameIndices, {
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
        return this.fence = require('game.Bounds').rect(0, 0, this.map.width, this.map.height);
      }
    });
    return LiveObject;
  });

}).call(this);

(function() {

  define('game.Map', function() {
    var Map, assignable, attachable, meta, tickable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, attachable = _ref.attachable, tickable = _ref.tickable;
    Map = meta.def(assignable, attachable, tickable, {
      init: function(name, width, height, fn) {
        var bg, fg;
        this.name = name;
        this.width = width;
        this.height = height;
        fg = require('game.Foreground').create(this, this.width, this.height);
        bg = require('game.Background').create(this, this.width, this.height);
        fn(fg, bg);
        this.foreground = fg;
        this.background = bg;
        this.up = this.down = this.left = this.right = null;
        return this.isActive = false;
      },
      setParent: function(parent) {
        this._super(parent);
        this.viewport = parent;
        this.foreground.setParent(parent);
        return this.background.setParent(parent);
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
      attach: function() {
        this.foreground.attach();
        this.background.attach();
        return this;
      },
      detach: function() {
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
    return Map;
  });

}).call(this);

(function() {

  define('game.mapCollection', function() {
    var add, get, maps;
    maps = {};
    get = function(name) {
      var imageCollection, img, spr, spriteCollection;
      imageCollection = require('game.imageCollection');
      spriteCollection = require('game.spriteCollection');
      spr = spriteCollection.get;
      img = imageCollection.get;
      return maps[name] = require("game/maps/" + name)(add, img, spr);
    };
    add = function(name, width, height, fn) {
      var map;
      map = require('game.Map').create(name, width, height, fn);
      maps[name] = map;
      return map;
    };
    return {
      get: get,
      add: add
    };
  });

}).call(this);

(function() {

  define('game.MapTile', function() {
    var MapTile, assignable, meta, simpleDrawable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;
    MapTile = meta.def('game.MapTile', assignable, simpleDrawable, {
      init: function(drawable) {
        this.drawable = drawable;
        return this.mbounds = require('game.Bounds').rect(0, 0, this.drawable.width, this.drawable.height);
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
    return MapTile;
  });

}).call(this);

(function() {
  var __slice = Array.prototype.slice;

  define('game.Mappable', function() {
    var Mappable, meta;
    meta = require('meta');
    Mappable = meta.def({
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
        return this.mbounds = require('game.Bounds').rect(0, 0, this.width, this.height);
      },
      _initBoundsInViewport: function() {
        return this.vbounds = require('game.Bounds').rect(0, 0, this.width, this.height);
      }
    });
    return Mappable;
  });

}).call(this);

(function() {

  define('game/maps/lw_52', function() {
    return function(map, img, spr) {
      return map('lw_52', 1024, 1024, function(fg, bg) {
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
        eightStone = require('game.StillObject').create('8stone', 32, 32);
        fg.add(require('game.Block').create(192, 176), [288, 352]);
        fg.add(eightStone, [256, 640]);
        return fg.onLoad(function() {
          return this.player.setMapPosition(368, 592);
        });
      });
    };
  });

}).call(this);

(function() {

  define('game.player', function() {
    var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, LiveObject, dir, eventable, keyCode, keyboard, player, _i, _j, _len, _len2, _ref;
    eventable = require('roles').eventable;
    keyboard = require('game.keyboard');
    LiveObject = require('game.LiveObject');
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
    player = LiveObject.clone();
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
          state = 'move' + require('util').capitalize(direction);
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
        var viewport;
        viewport = require('game.viewport');
        return this.fence = require('game.Bounds').rect(0, 0, viewport.width, viewport.height).withScale(this.viewportPadding);
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
    return player;
  });

}).call(this);

(function() {

  define('game.spriteCollection', function() {
    var ImageSequence, add, each, get, imageCollection, sprites;
    ImageSequence = require('game.ImageSequence');
    imageCollection = require('game.imageCollection');
    sprites = {};
    add = function(name, width, height, frameIndices, opts) {
      if (opts == null) opts = {};
      return sprites[name] = ImageSequence.create(name, imageCollection.get(name), width, height, frameIndices, opts);
    };
    get = function(name) {
      return sprites[name] || (function() {
        throw new Error("Couldn't find sprite " + name + "!");
      })();
    };
    each = function(fn) {
      var names;
      names = $.v.keys(sprites).sort();
      return $.v.each(names, function(name) {
        return fn(sprites[name]);
      });
    };
    add('flower', 16, 16, [2, 0, 1], {
      frameDuration: 6,
      doesRepeat: true
    });
    return {
      get: get,
      each: each
    };
  });

}).call(this);

(function() {

  define('game.StillObject', function() {
    var Collidable, Mappable, StillObject, assignable, drawable, meta, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, drawable = _ref.drawable;
    Mappable = require('game.Mappable');
    Collidable = require('game.Collidable');
    StillObject = meta.def('game.StillObject', assignable, Mappable, Collidable, drawable, {
      init: function(imagePath, width, height) {
        this._super(width, height);
        this.image = require('game.imageCollection').get(imagePath);
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
    return StillObject;
  });

}).call(this);
