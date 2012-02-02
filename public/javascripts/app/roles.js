var __slice = Array.prototype.slice;

define(function(require) {
  var ROLES, attachable, drawable, eventHelpers, eventable, loadable, meta, runnable, tickable, _getSafeNameFrom;
  meta = require('app/meta2');
  ROLES = ['game.eventable', 'game.attachable', 'game.tickable', 'game.drawable', 'game.loadable', 'game.runnable'];
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
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      return this.setElement();
    },
    setElement: function() {
      throw new Error('setElement must be overridden');
    },
    assignTo: function(parent) {
      return this.parent = parent;
    },
    destroy: function() {
      if (this.$element) this.detach();
      return this._super();
    },
    attach: function() {
      return this.$element.appendTo(this.parent.$element);
    },
    detach: function() {
      return this.$element.detach();
    }
  });
  tickable = meta.def('game.tickable', {
    tick: function() {
      throw new Error('tick must be overridden');
    }
  });
  drawable = meta.def('game.drawable', tickable, {
    predraw: function() {
      throw new Error('predraw must be overridden');
    },
    draw: function() {
      throw new Error('draw must be overridden');
    },
    postdraw: function() {
      throw new Error('postdraw must be overridden');
    }
  });
  loadable = meta.def('game.loadable', {
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._super.apply(this, args);
      return this.isLoaded = false;
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
  return {
    ROLES: ROLES,
    eventable: eventable,
    attachable: attachable,
    tickable: tickable,
    drawable: drawable,
    loadable: loadable,
    runnable: runnable
  };
});
