(function() {
  var Class, baseModule, game, module, _extend, _fnContainsSuper, _wrap,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  game = (window.game || (window.game = {}));

  _fnContainsSuper = function(fn) {
    return /\b_super\b/.test(fn);
  };

  _wrap = function(k, fn, val) {
    return function() {
      var ret, tmp;
      tmp = this._super;
      this._super = val;
      ret = fn.apply(this, arguments);
      this._super = tmp;
      return ret;
    };
  };

  _extend = function(target, source, opts) {
    var includeRoles, k, role, roles, sk, targetClass, tk, translations, _i, _len, _ref, _ref1, _ref2, _super;
    if (opts == null) {
      opts = {};
    }
    _super = (_ref = opts._super) != null ? _ref : target;
    includeRoles = (_ref1 = opts.includeRoles) != null ? _ref1 : true;
    translations = target.__translations__ || {};
    targetClass = (_ref2 = opts.targetClass) != null ? _ref2 : target;
    if ((source.__name__ != null) && (target.__roles__ != null) && target.__roles__[source.__name__]) {
      return;
    }
    for (sk in source) {
      if (!__hasProp.call(source, sk)) continue;
      tk = translations[sk] || sk;
      if (typeof source[sk] === 'function' && _fnContainsSuper(source[sk])) {
        if (typeof _super[tk] === 'function') {
          target[tk] = _wrap(sk, source[sk], _super[tk]);
        } else {
          target[tk] = _wrap(sk, source[sk], function() {});
        }
      } else if ($.v.is.arr(source[k]) || game.util.isPlainObject(source[k])) {
        target[k] = game.util.clone(source[k]);
      } else {
        target[tk] = source[sk];
      }
    }
    if (includeRoles && (targetClass.__roles__ != null)) {
      roles = [];
      if (source.__name__ != null) {
        roles.push(source.__name__);
      }
      if (source.__roles__ != null) {
        for (k in source.__roles__) {
          roles.push(k);
        }
      }
      for (_i = 0, _len = roles.length; _i < _len; _i++) {
        role = roles[_i];
        targetClass.__roles__[role] = 1;
      }
    }
    if (typeof source.__extended__ === 'function') {
      source.__extended__.call(source, target);
    }
    return target;
  };

  Class = function() {};

  Object.defineProperty(Class, '__name__', {
    value: 'Class',
    writable: false,
    enumerable: false,
    configurable: false
  });

  Class.prototype.init = function() {
    return this.reset();
  };

  Class.prototype.reset = function() {};

  Class.prototype.destroy = function() {
    return this.reset();
  };

  Class.extend = function() {
    var args, childClass, classdef, k, members, mixin, mixins, name, noop, parentClass, parentInstance, parentProto, role, roles, statics, v, _i, _j, _len, _len1, _ref, _ref1;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (typeof args[0] === 'string') {
      name = args.shift();
    }
    classdef = args.pop();
    mixins = args;
    if (typeof classdef === 'function') {
      classdef = {
        init: classdef
      };
    }
    if ((classdef.statics != null) || (classdef.members != null) || (classdef.roles != null)) {
      statics = (_ref = classdef.statics) != null ? _ref : {};
      members = (_ref1 = classdef.members) != null ? _ref1 : {};
      if (classdef.roles != null) {
        game.util.extend(members, classdef.roles);
      }
    } else {
      statics = {};
      members = classdef;
    }
    parentClass = this;
    parentProto = parentClass.prototype;
    noop = function() {};
    Object.defineProperty(noop, '__name__', {
      value: 'noop',
      writable: false,
      enumerable: false,
      configurable: false
    });
    noop.prototype.constructor = parentClass;
    noop.prototype = parentProto;
    parentInstance = new noop();
    childClass = function(args) {
      this.init.apply(this, args && args.callee ? args : arguments);
      return this;
    };
    for (k in parentClass) {
      if (!__hasProp.call(parentClass, k)) continue;
      v = parentClass[k];
      childClass[k] = v;
    }
    childClass.init = function() {
      return new childClass(arguments);
    };
    childClass.prototype = parentInstance;
    childClass.prototype.constructor = childClass;
    Object.defineProperty(childClass, '__name__', {
      value: name,
      writable: false,
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(childClass, '__superclass__', {
      value: parentClass,
      writable: false,
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(childClass, '__roles__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });
    if (parentClass !== Class) {
      roles = [parentClass.__name__].concat($.v.keys(parentClass.__roles__));
      for (_i = 0, _len = roles.length; _i < _len; _i++) {
        role = roles[_i];
        childClass.__roles__[role] = 1;
      }
    }
    childClass.extend = arguments.callee;
    childClass["static"] = childClass.statics = function(obj, fn) {
      if (typeof obj === 'string') {
        name = obj;
        obj = {};
        obj[name] = fn;
      }
      _extend(this, obj, {
        _super: parentClass,
        includeRoles: false
      });
      return this;
    };
    childClass.role = childClass.roles = childClass.does = childClass.member = childClass.members = function() {
      var fn, obj, objs, _j, _len1;
      objs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof objs[0] === 'string') {
        name = objs[0], fn = objs[1];
        obj = {};
        obj[name] = fn;
        objs = [obj];
      }
      for (_j = 0, _len1 = objs.length; _j < _len1; _j++) {
        obj = objs[_j];
        _extend(parentInstance, obj, {
          _super: parentProto,
          targetClass: childClass
        });
      }
      return this;
    };
    childClass.prototype.role = childClass.prototype.roles = childClass.prototype.does = childClass.prototype.method = childClass.prototype.methods = function() {
      var fn, obj, objs, _j, _len1;
      objs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof objs[0] === 'string') {
        name = objs[0], fn = objs[1];
        obj = {};
        obj[name] = fn;
        objs = [obj];
      }
      for (_j = 0, _len1 = objs.length; _j < _len1; _j++) {
        obj = objs[_j];
        _extend(this, obj, {
          _super: parentProto,
          includeRoles: false
        });
      }
      return this;
    };
    childClass.can = function() {
      var roles, _j, _len1;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_j = 0, _len1 = roles.length; _j < _len1; _j++) {
        role = roles[_j];
        if (!this.__roles__[role]) {
          return false;
        }
      }
      return true;
    };
    childClass.prototype.can = function() {
      var roles, _j, _len1;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_j = 0, _len1 = roles.length; _j < _len1; _j++) {
        role = roles[_j];
        if (!this.constructor.__roles__[role]) {
          return false;
        }
      }
      return true;
    };
    if (statics) {
      childClass.statics(statics);
    }
    for (_j = 0, _len1 = mixins.length; _j < _len1; _j++) {
      mixin = mixins[_j];
      childClass.members(mixin);
    }
    childClass.members(members);
    if (childClass !== Class && typeof parentClass.__inherited__ === 'function') {
      parentClass.__inherited__(childClass);
    }
    return childClass;
  };

  baseModule = (function() {
    var mod;
    mod = {};
    mod.__translations__ = {
      init: '_init',
      destroy: '_destroy'
    };
    mod.isInit = false;
    mod.method = mod.methods = mod.role = mod.roles = mod.does = mod.extend = function() {
      var fn, mixin, mixins, name, _i, _len;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof mixins[0] === 'string') {
        name = mixins[0], fn = mixins[1];
        mixin = {};
        mixin[name] = fn;
        mixins = [mixin];
      }
      for (_i = 0, _len = mixins.length; _i < _len; _i++) {
        mixin = mixins[_i];
        _extend(this, mixin);
      }
      return this;
    };
    mod.can = function() {
      var role, roles, _i, _len;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = roles.length; _i < _len; _i++) {
        role = roles[_i];
        if (!this.__roles__[role]) {
          return false;
        }
      }
      return true;
    };
    mod.addTranslations = function(obj) {
      return this.__translations__ = $.v.extend({}, this.__translations__, obj);
    };
    mod.init = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.isInit) {
        this.reset();
        this._init.apply(this, args);
        this.isInit = true;
      }
      return this;
    };
    mod._init = function() {};
    mod.reset = function() {};
    mod.destroy = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.isInit) {
        this._destroy.apply(this, args);
        this.reset();
        this.isInit = false;
      }
      return this;
    };
    mod._destroy = function() {};
    return mod;
  })();

  module = function() {
    var mixins, mod, name;
    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (typeof mixins[0] === 'string') {
      name = mixins.shift();
    }
    mod = game.util.createFromProto(baseModule);
    mod.__name__ = name;
    Object.defineProperty(mod, '__name__', {
      value: name,
      writable: false,
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(mod, '__roles__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });
    mod.extend.apply(mod, mixins);
    return mod;
  };

  game.meta = {
    module: module,
    Class: Class,
    extend: _extend
  };

  window.scriptLoaded('app/meta');

}).call(this);
