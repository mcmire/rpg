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

}).call(this);
