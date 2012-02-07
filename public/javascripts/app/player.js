(function() {
  var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, Mob, dir, eventable, game, keyCode, keyboard, player, util, _i, _j, _len, _len2, _ref;

  game = (window.game || (window.game = {}));

  util = game.util;

  eventable = game.roles.eventable;

  keyboard = game.keyboard;

  Mob = game.Mob;

  DIRECTIONS = 'up down left right'.split(' ');

  DIRECTION_KEYS = {
    up: keyboard.keyCodesFor('KEY_W', 'KEY_UP', 'KEY_K'),
    down: keyboard.keyCodesFor('KEY_S', 'KEY_DOWN', 'KEY_J'),
    left: keyboard.keyCodesFor('KEY_A', 'KEY_LEFT', 'KEY_H'),
    right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT', 'KEY_L')
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

  player = Mob.cloneAs('game.player');

  player.extend(eventable, {
    viewportPadding: 30,
    keyTracker: keyboard.KeyTracker.create(KEYS),
    __plugged__: function(core) {
      return core.collisionLayer.add(this);
    },
    init: function() {
      this._super('link2x', 34, 48, 4);
      this.addState('moveLeft', [0, 1, 2, 3, 4, 5, 6, 7], {
        frameDuration: 2,
        doesRepeat: true,
        "do": 'moveLeft'
      });
      this.addState('moveRight', [8, 9, 10, 11, 12, 13, 14, 15], {
        frameDuration: 2,
        doesRepeat: true,
        "do": 'moveRight'
      });
      this.addState('moveDown', [16, 17, 18, 19, 20, 21, 22], {
        frameDuration: 2,
        doesRepeat: true,
        "do": 'moveDown'
      });
      this.addState('moveUp', [23, 24, 25, 26, 27, 28], {
        frameDuration: 2,
        doesRepeat: true,
        "do": 'moveUp'
      });
      this.addState('idleLeft', [0], {
        frameDuration: 2,
        doesRepeat: true
      });
      this.addState('idleRight', [8], {
        frameDuration: 2,
        doesRepeat: true
      });
      this.addState('idleDown', [19], {
        frameDuration: 2,
        doesRepeat: true
      });
      this.addState('idleUp', [23], {
        frameDuration: 2,
        doesRepeat: true
      });
      this.setState('idleDown');
      this.addEvents();
      return this;
    },
    addEvents: function() {
      return keyboard.addKeyTracker(this.keyTracker);
    },
    removeEvents: function() {
      return keyboard.removeKeyTracker(this.keyTracker);
    },
    predraw: function() {
      var direction, state;
      if (keyCode = this.keyTracker.getLastPressedKey()) {
        direction = KEY_DIRECTIONS[keyCode];
        state = 'move' + util.capitalize(direction);
      } else {
        state = this.currentState.name.replace('move', 'idle');
      }
      if (state !== this.currentState.name) this.setState(state);
      return this._super();
    },
    moveLeft: function() {
      var map, nextBoundsOnMap, x, _base;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        x: -this.speed
      });
      if (x = this.allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('x1', x);
        return;
      }
      if ((this.viewport.bounds.x1 - this.speed) < 0) {
        if (map = typeof (_base = this.core.currentMap).getAreaLeft === "function" ? _base.getAreaLeft() : void 0) {
          return this.core.currentMap.loadArea(map);
        } else {
          this.viewport.translateBySide('x1', 0);
          if (nextBoundsOnMap.x1 < 0) {
            return this.bounds.onMap.translateBySide('x1', 0);
          } else {
            return this.bounds.onMap.replace(nextBoundsOnMap);
          }
        }
      } else {
        this.bounds.onMap.replace(nextBoundsOnMap);
        if ((this.bounds.inViewport.x1 - this.speed) < this.fence.x1) {
          return this.viewport.translateBySide('x1', this.bounds.onMap.x1 - this.viewportPadding);
        }
      }
    },
    moveRight: function() {
      var map, mapWidth, x, _base;
      this.bounds.onMap.withTranslation({
        x: +this.speed
      });
      if (x = this.allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('x2', x);
        return;
      }
      mapWidth = this.core.currentMap.width;
      if ((this.viewport.bounds.x2 + this.speed) > mapWidth) {
        if (map = typeof (_base = this.core.currentMap).getAreaRight === "function" ? _base.getAreaRight() : void 0) {
          return this.core.currentMap.loadArea(map);
        } else {
          this.viewport.translateBySide('x2', mapWidth);
          if (nextBoundsOnMap.x2 > mapWidth) {
            return this.bounds.onMap.translateBySide('x2', mapWidth);
          } else {
            return this.bounds.onMap.replace(nextBoundsOnMap);
          }
        }
      } else {
        this.bounds.onMap.replace(nextBoundsOnMap);
        if ((this.bounds.inViewport.x2 + this.speed) > this.fence.x2) {
          return this.viewport.translateBySide('x2', this.bounds.onMap.x2 + this.viewportPadding);
        }
      }
    },
    moveUp: function() {
      var map, nextBoundsOnMap, y, _base;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: -this.speed
      });
      if (y = this.allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) {
        this.bounds.onMap.translateBySide('y1', y);
        return;
      }
      if ((this.viewport.bounds.y1 - this.speed) < 0) {
        if (map = typeof (_base = this.core.currentMap).getAreaUp === "function" ? _base.getAreaUp() : void 0) {
          return this.core.currentMap.loadArea(map);
        } else {
          this.viewport.translateBySide('y1', 0);
          if (nextBoundsOnMap.y1 < 0) {
            return this.bounds.onMap.translateBySide('y1', 0);
          } else {
            return this.bounds.onMap.replace(nextBoundsOnMap);
          }
        }
      } else {
        this.bounds.onMap.replace(nextBoundsOnMap);
        if ((this.bounds.inViewport.y1 - this.speed) < this.fence.y1) {
          return this.viewport.translateBySide('y2', this.bounds.onMap.y1 - this.viewportPadding);
        }
      }
    },
    moveDown: function() {
      var map, mapHeight, nextBoundsOnMap, y, _base;
      nextBoundsOnMap = this.bounds.onMap.withTranslation({
        y: this.speed
      });
      if (y = this.allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) {
        this.translateBySide('y2', y);
        return;
      }
      mapHeight = this.core.currentMap.height;
      if ((this.viewport.bounds.y2 + this.speed) > mapHeight) {
        if (map = typeof (_base = this.core.currentMap).getAreaDown === "function" ? _base.getAreaDown() : void 0) {
          return this.core.currentMap.loadArea(map);
        } else {
          this.viewport.translateBySide('y2', mapHeight);
          if (nextBoundsOnMap.y2 > mapHeight) {
            return this.bounds.onMap.translateBySide('y2', mapHeight);
          } else {
            return this.bounds.onMap.replace(nextBoundsOnMap);
          }
        }
      } else {
        this.bounds.onMap.replace(nextBoundsOnMap);
        if ((this.bounds.inViewport.y2 + this.speed) > this.fence.y2) {
          return this.viewport.translateBySide('y2', this.bounds.onMap.y2 + this.viewportPadding);
        }
      }
    },
    _initBoundsOnMap: function() {
      this._super();
      return this.bounds.onMap = game.Bounds.at(372, 540, 406, 588);
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(0, 0, game.viewport.width, game.viewport.height);
    }
  });

  game.player = player;

  window.scriptLoaded('game.player');

}).call(this);
