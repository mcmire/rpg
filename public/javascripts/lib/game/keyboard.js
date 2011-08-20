(function() {
  var DOMEventHelpers, game;
  var __slice = Array.prototype.slice;
  game = window.game;
  DOMEventHelpers = game.DOMEventHelpers;
  game.util.module('game.Keyboard', [DOMEventHelpers], {
    keys: {
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
      KEY_D: 68
    },
    modifierKeys: [16, 17, 18, 91],
    keyHandlers: {},
    init: function() {
      if (!this.isInit) {
        this.reset();
        this.isInit = true;
      }
      return this;
    },
    reset: function() {
      this.pressedKeys = {};
      this.activeKeyHandlers = {};
      return this;
    },
    destroy: function() {
      if (this.isInit) {
        this.reset();
        this.removeEvents();
        this.isInit = false;
      }
      return this;
    },
    addEvents: function() {
      var self;
      self = this;
      this.bindEvents(document, {
        keydown: function(event) {
          var key, _base;
          key = event.keyCode;
          self.pressedKeys[key] = 1;
          if (key in self.keyHandlers) {
            (_base = self.activeKeyHandlers)[key] || (_base[key] = self.keyHandlers[key]);
            if (typeof self.globalKeyHandler === "function") {
              self.globalKeyHandler();
            }
            return event.preventDefault();
          }
        },
        keyup: function(event) {
          var key;
          key = event.keyCode;
          delete self.pressedKeys[key];
          delete self.activeKeyHandlers[key];
          return event.preventDefault();
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
      this.unbindEvents(document, "keydown", "keyup");
      this.unbindEvents(window, "blur");
      return this;
    },
    runHandlers: function() {
      var handler, key, _ref, _results;
      _ref = this.activeKeyHandlers;
      _results = [];
      for (key in _ref) {
        handler = _ref[key];
        _results.push(handler());
      }
      return _results;
    },
    addKeyHandler: function() {
      var callback, keyName, keyNames, _i, _j, _len, _results;
      keyNames = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
      if (keyNames.length) {
        _results = [];
        for (_j = 0, _len = keyNames.length; _j < _len; _j++) {
          keyName = keyNames[_j];
          _results.push(this.keyHandlers[this.keys[keyName]] = callback);
        }
        return _results;
      } else {
        return this.globalKeyHandler = callback;
      }
    },
    isKeyPressed: function(arg) {
      var keyCode;
      if (typeof arg === "string") {
        keyCode = this.keys[arg];
        if (!keyCode) {
          throw new Error("'" + arg + "' is not a valid key");
        }
      } else {
        keyCode = arg;
      }
      return this.pressedKeys.hasOwnProperty(keyCode);
    },
    modifierKeyPressed: function(event) {
      return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
    }
  });
}).call(this);
