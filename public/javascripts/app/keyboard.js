(function() {
  var EventHelpers, KEYS, KeyTracker, MODIFIER_KEYS, PressedKeys, game, keyboard,
    __slice = Array.prototype.slice;

  game = window.game;

  EventHelpers = game.EventHelpers;

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

  PressedKeys = (function() {

    function PressedKeys() {
      this.reset();
    }

    PressedKeys.prototype.reset = function() {
      this.tsByKey = {};
      return this.keys = [];
    };

    PressedKeys.prototype.get = function(key) {
      return this.tsByKey[key];
    };

    PressedKeys.prototype.put = function(key, ts) {
      if (this.has(key)) this.del(key);
      this.tsByKey[key] = ts;
      return this.keys.unshift(key);
    };

    PressedKeys.prototype.del = function(key) {
      var ts;
      if (this.has(key)) {
        ts = this.tsByKey[key];
        delete this.tsByKey[key];
        return this.keys.splice(this.keys.indexOf(key), 1);
      }
    };

    PressedKeys.prototype.has = function(key) {
      return this.tsByKey.hasOwnProperty(key);
    };

    PressedKeys.prototype.each = function(fn) {
      var key, _i, _len, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(fn(key, this.tsByKey[key]));
      }
      return _results;
    };

    return PressedKeys;

  })();

  KeyTracker = (function() {

    function KeyTracker(keyCodes) {
      this.trackedKeys = $.reduce(keyCodes, (function(o, c) {
        o[c] = 1;
        return o;
      }), {});
      this.pressedKeys = new PressedKeys();
    }

    KeyTracker.prototype.keydown = function(keyCode, ts) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.put(keyCode, ts);
        return true;
      }
      return false;
    };

    KeyTracker.prototype.keyup = function(keyCode) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.del(keyCode);
        return true;
      }
      return false;
    };

    KeyTracker.prototype.isKeyPressed = function() {
      var key, keyCode, keys, _i, _len, _ref;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = $.flatten(keys);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        keyCode = keyboard.keyCodeFor(key);
        if (self.pressedKeys.has(keyCode)) return true;
      }
      return false;
    };

    KeyTracker.prototype.clearStuckKeys = function(now) {
      var self;
      self = this;
      return this.pressedKeys.each(function(key, ts) {
        if ((now - ts) >= 500) return self.pressedKeys.del(key);
      });
    };

    KeyTracker.prototype.getLastPressedKey = function() {
      return this.pressedKeys.keys[0];
    };

    KeyTracker.prototype.reset = function() {
      return this.pressedKeys.reset();
    };

    return KeyTracker;

  })();

  keyboard = game.util.module('game.keyboard', [EventHelpers]);

  keyboard.KeyTracker = KeyTracker;

  keyboard.keys = KEYS;

  keyboard.modifierKeys = MODIFIER_KEYS;

  keyboard.keyHandlers = {};

  keyboard.init = function() {
    if (!this.isInit) {
      this.keyTrackers = [];
      this.debugTimer = new Date();
      this.reset();
      this.isInit = true;
    }
    return this;
  };

  keyboard.reset = function() {
    var keyTracker, _i, _len, _ref;
    _ref = this.keyTrackers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      keyTracker = _ref[_i];
      keyTracker.reset();
    }
    return this;
  };

  keyboard.destroy = function() {
    if (this.isInit) {
      this.reset();
      this.removeEvents();
      this.isInit = false;
    }
    return this;
  };

  keyboard.addEvents = function() {
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
  };

  keyboard.removeEvents = function() {
    this.unbindEvents(document, 'keydown', 'keyup');
    this.unbindEvents(window, 'blur');
    return this;
  };

  keyboard.addKeyTracker = function(tracker) {
    return this.keyTrackers.push(tracker);
  };

  keyboard.removeKeyTracker = function(tracker) {
    return this.keyTrackers.splice(this.keyTrackers.indexOf(tracker), 1);
  };

  keyboard.trapKeys = function() {
    var key, keys, _i, _len, _results;
    keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    keys = $.ensureArray(keys);
    _results = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (typeof key === 'string') key = KEYS[key];
      _results.push(this.trappedKeys[key] = 1);
    }
    return _results;
  };

  keyboard.releaseKeys = function() {
    var key, keys, _i, _len, _results;
    keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    keys = $.ensureArray(keys);
    _results = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (typeof key === 'string') key = KEYS[key];
      _results.push(delete this.trappedKeys[key]);
    }
    return _results;
  };

  keyboard.isKeyPressed = function() {
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
  };

  keyboard.clearStuckKeys = function(now) {
    var tracker, _i, _len, _ref, _results;
    _ref = this.keyTrackers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tracker = _ref[_i];
      _results.push(tracker.clearStuckKeys(now));
    }
    return _results;
  };

  keyboard.modifierKeyPressed = function(event) {
    return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
  };

  keyboard.keyCodesFor = function() {
    var keys;
    keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    keys = $.ensureArray(keys);
    return $.map(keys, function(key) {
      return keyboard.keyCodeFor(key);
    });
  };

  keyboard.keyCodeFor = function(key) {
    var keyCode;
    if (typeof key === 'string') {
      keyCode = KEYS[key];
      if (!keyCode) throw new Error("'" + arg + "' is not a valid key");
      return keyCode;
    } else {
      return key;
    }
  };

}).call(this);
