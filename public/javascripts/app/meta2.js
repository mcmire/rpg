(function() {
  var game, proto, _clone, _def, _extend, _fnContainsSuper, _wrap,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  _fnContainsSuper = function(fn) {
    return /\b_super(?:\.apply)?\(/.test(fn);
  };

  _wrap = function(fn, val) {
    var newfn;
    newfn = function() {
      var ret, tmp;
      tmp = this._super;
      this._super = val;
      ret = fn.apply(this, arguments);
      this._super = tmp;
      return ret;
    };
    newfn.__original__ = fn;
    newfn.__super__ = val;
    return newfn;
  };

  _clone = function(obj) {
    return Object.create(obj);
  };

  _extend = function(base, mixin, opts) {
    var exclusions, keyTranslations, sk, tk, _super;
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
    value: 'game.meta.proto'
  });

  Object.defineProperty(proto, '_super', {
    value: function() {}
  });

  proto.clone = function() {
    return _clone(this);
  };

  proto.cloneAs = function(name) {
    var clone;
    clone = this.clone();
    clone.__name__ = name;
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
        value: name
      });
    }
    Object.defineProperty(obj, '__mixins__', {
      value: {}
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
