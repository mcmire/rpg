(function() {
  var common, proto, _clone, _def, _extend, _fnContainsSuper, _wrap,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  common = (window.common || (window.common = {}));

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
      value: common.util.dup(this.__mixins__),
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

  common.meta = {
    def: _def,
    extend: _extend,
    clone: _clone
  };

}).call(this);
