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
