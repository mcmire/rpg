var __slice = Array.prototype.slice,
  __hasProp = Object.prototype.hasOwnProperty;

define(function(require) {
  var $, Class, module, _extend, _fnContainsSuper, _wrap;
  $ = require('vendor/ender');
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
  _extend = function() {
    var args, base, cons, ext, includeRoles, k, _super;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    includeRoles = true;
    if (typeof args[0] === 'boolean') includeRoles = args.shift();
    base = args[0], ext = args[1], _super = args[2], cons = args[3];
    if (_super == null) _super = base;
    if (cons == null) cons = base;
    for (k in ext) {
      if (!__hasProp.call(ext, k)) continue;
      if (/^__/.test(k)) continue;
      if (typeof ext[k] === 'function' && _fnContainsSuper(ext[k])) {
        if (typeof _super[k] === 'function') {
          base[k] = _wrap(k, ext[k], _super[k]);
        } else {
          base[k] = _wrap(k, ext[k], function() {});
        }
      } else if ($.v.is.arr(ext[k]) || $.v.is.obj(ext[k])) {
        base[k] = $.clone(ext[k]);
      } else {
        base[k] = ext[k];
      }
    }
    if (base.__name__ === 'game.main') throw 'ok great';
    if ((base.__roles__ != null) && (ext.__name__ != null)) {
      base.__roles__[ext.__name__] = 1;
    }
    return base;
  };
  Class = function() {};
  Class.__name__ = 'Class';
  Class.prototype.init = function() {
    return this.reset;
  };
  Class.prototype.reset = function() {
    throw new Error('must be overridden');
  };
  Class.prototype.destroy = function() {
    return this.reset();
  };
  Class.extend = function() {
    var args, childClass, classdef, k, members, mixin, mixins, name, noop, parentClass, parentInstance, parentProto, statics, v, _i, _len, _ref, _ref2;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (typeof args[0] === 'string') name = args.shift();
    classdef = args.pop();
    mixins = args;
    if (typeof classdef === 'function') {
      classdef = {
        init: classdef
      };
    }
    if ((classdef.statics != null) || (classdef.members != null) || (classdef.roles != null)) {
      statics = (_ref = classdef.statics) != null ? _ref : {};
      members = (_ref2 = classdef.members) != null ? _ref2 : {};
      if (classdef.roles != null) $.extend(members, classdef.roles);
    } else {
      statics = {};
      members = classdef;
    }
    parentClass = this;
    parentProto = parentClass.prototype;
    noop = function() {};
    noop.__name__ = 'noop';
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
    childClass.__name__ = name;
    childClass.superclass = parentClass;
    childClass.__roles__ = {};
    childClass.extend = arguments.callee;
    childClass.static = childClass.statics = function(obj, fn) {
      if (typeof obj === 'string') {
        name = obj;
        obj = {};
        obj[name] = fn;
      }
      _extend(this, obj, parentClass, childClass);
      return this;
    };
    childClass.role = childClass.roles = childClass.does = childClass.member = childClass.members = function() {
      var fn, obj, objs, _i, _len;
      objs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof objs[0] === 'string') {
        name = objs[0], fn = objs[1];
        obj = {};
        obj[name] = fn;
        objs = [obj];
      }
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        _extend(parentInstance, obj, parentProto, childClass);
      }
      return this;
    };
    childClass.prototype.role = childClass.prototype.roles = childClass.prototype.does = childClass.prototype.method = childClass.prototype.methods = function() {
      var fn, obj, objs, _i, _len;
      objs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof objs[0] === 'string') {
        name = objs[0], fn = objs[1];
        obj = {};
        obj[name] = fn;
        objs = [obj];
      }
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        _extend(this, obj, parentProto, childClass);
      }
      return this;
    };
    childClass.can = function() {
      var role, roles, _i, _len;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = roles.length; _i < _len; _i++) {
        role = roles[_i];
        if (!this.__roles__[role]) return false;
      }
      return true;
    };
    childClass.prototype.can = function() {
      var role, roles, _i, _len;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = roles.length; _i < _len; _i++) {
        role = roles[_i];
        if (!this.constructor.__roles__[role]) return false;
      }
      return true;
    };
    if (statics) childClass.statics(statics);
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      childClass.members(mixin);
    }
    childClass.members(members);
    return childClass;
  };
  module = function() {
    var destroy, init, mixin, mixins, mod, name, reset, _ref, _ref2, _ref3;
    name = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    mod = {};
    mod.__name__ = name;
    mod.__roles__ = {};
    mod.method = mod.methods = mod.role = mod.roles = mod.does = mod.extend = function() {
      var fn, includeRoles, mixin, mixins, _i, _len;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      includeRoles = true;
      if (typeof mixins[0] === 'boolean') includeRoles = mixins.shift();
      if (typeof mixins[0] === 'string') {
        name = mixins[0], fn = mixins[1];
        mixin = {};
        mixin[name] = fn;
        mixins = [mixin];
      }
      for (_i = 0, _len = mixins.length; _i < _len; _i++) {
        mixin = mixins[_i];
        _extend(includeRoles, this, mixin);
      }
      return this;
    };
    mod.can = function() {
      var role, roles;
      roles = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = roles.length; _i < _len; _i++) {
          role = roles[_i];
          _results.push(!this.__roles__[role]);
        }
        return _results;
      }).call(this)) {
        return false;
      }
      return true;
    };
    mixin = {};
    mod.extend.apply(mixin, [false].concat(mixins));
    init = (_ref = mixin.init) != null ? _ref : function() {};
    reset = (_ref2 = mixin.reset) != null ? _ref2 : function() {};
    destroy = (_ref3 = mixin.destroy) != null ? _ref3 : function() {};
    delete mixin.init;
    delete mixin.reset;
    delete mixin.destroy;
    mod.init = function() {
      if (!this.isInit) {
        this.reset();
        init.apply(this, arguments);
        this.isInit = true;
      }
      return this;
    };
    mod.reset = function() {
      reset.apply(this, arguments);
      return this;
    };
    mod.destroy = function() {
      if (this.isInit) {
        destroy.apply(this, arguments);
        this.reset();
        this.isInit = false;
      }
      return this;
    };
    mod.extend(mixin);
    return mod;
  };
  return {
    module: module
  };
  return {
    Class: Class,
    extend: _extend
  };
});
