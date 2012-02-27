(function() {

  define('game.player', function() {
    var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, LiveObject, dir, eventable, keyCode, keyboard, player, _i, _j, _len, _len2, _ref;
    eventable = require('roles').eventable;
    keyboard = require('game.keyboard');
    LiveObject = require('game.LiveObject');
    DIRECTIONS = 'up down left right'.split(' ');
    DIRECTION_KEYS = {
      up: keyboard.keyCodesFor('KEY_W', 'KEY_UP'),
      down: keyboard.keyCodesFor('KEY_S', 'KEY_DOWN'),
      left: keyboard.keyCodesFor('KEY_A', 'KEY_LEFT'),
      right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT')
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
    player = LiveObject.clone();
    player.extend(eventable, {
      viewportPadding: 30,
      keyTracker: keyboard.KeyTracker.create(KEYS),
      addEvents: function() {
        return keyboard.addKeyTracker(this.keyTracker);
      },
      removeEvents: function() {
        return keyboard.removeKeyTracker(this.keyTracker);
      },
      activate: function() {
        this.setState('idleRight');
        return this.addEvents();
      },
      deactivate: function() {
        return this.removeEvents();
      },
      predraw: function(ctx) {
        var direction, state;
        this._super(ctx);
        if (keyCode = this.keyTracker.getLastPressedKey()) {
          direction = KEY_DIRECTIONS[keyCode];
          state = 'move' + require('util').capitalize(direction);
        } else {
          state = this.currentState.name.replace('move', 'idle');
        }
        if (state !== this.currentState.name) return this.setState(state);
      },
      moveLeft: function() {
        var map, nextBoundsOnMap, x, _base;
        nextBoundsOnMap = this.mbounds.withTranslation({
          x: -this.speed
        });
        if (x = this.mapCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) {
          this.doToMapBounds('translateBySide', 'x1', x);
          return;
        }
        if ((this.viewport.bounds.x1 - this.speed) < 0) {
          if (map = typeof (_base = this.map).getAreaLeft === "function" ? _base.getAreaLeft() : void 0) {
            return this.map.loadArea(map);
          } else {
            this.viewport.translateBySide('x1', 0);
            if (nextBoundsOnMap.x1 < 0) {
              return this.doToMapBounds('translateBySide', 'x1', 0);
            } else {
              return this.doToMapBounds('replace', nextBoundsOnMap);
            }
          }
        } else {
          this.doToMapBounds('replace', nextBoundsOnMap);
          if ((this.vbounds.x1 - this.speed) < this.fence.x1) {
            return this.viewport.translateBySide('x1', this.mbounds.x1 - this.viewportPadding);
          }
        }
      },
      moveRight: function() {
        var map, mapWidth, nextBoundsOnMap, x, _base;
        nextBoundsOnMap = this.mbounds.withTranslation({
          x: +this.speed
        });
        if (x = this.mapCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) {
          this.doToMapBounds('translateBySide', 'x2', x);
          return;
        }
        mapWidth = this.map.width;
        if ((this.viewport.bounds.x2 + this.speed) > mapWidth) {
          if (map = typeof (_base = this.map).getAreaRight === "function" ? _base.getAreaRight() : void 0) {
            return this.map.loadArea(map);
          } else {
            this.viewport.translateBySide('x2', mapWidth);
            if (nextBoundsOnMap.x2 > mapWidth) {
              return this.doToMapBounds('translateBySide', 'x2', mapWidth);
            } else {
              return this.doToMapBounds('replace', nextBoundsOnMap);
            }
          }
        } else {
          this.doToMapBounds('replace', nextBoundsOnMap);
          if ((this.vbounds.x2 + this.speed) > this.fence.x2) {
            return this.viewport.translateBySide('x2', this.mbounds.x2 + this.viewportPadding);
          }
        }
      },
      moveUp: function() {
        var map, nextBoundsOnMap, y, _base;
        nextBoundsOnMap = this.mbounds.withTranslation({
          y: -this.speed
        });
        if (y = this.mapCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) {
          this.doToMapBounds('translateBySide', 'y1', y);
          return;
        }
        if ((this.viewport.bounds.y1 - this.speed) < 0) {
          if (map = typeof (_base = this.map).getAreaUp === "function" ? _base.getAreaUp() : void 0) {
            return this.map.loadArea(map);
          } else {
            this.viewport.translateBySide('y1', 0);
            if (nextBoundsOnMap.y1 < 0) {
              return this.doToMapBounds('translateBySide', 'y1', 0);
            } else {
              return this.doToMapBounds('replace', nextBoundsOnMap);
            }
          }
        } else {
          this.doToMapBounds('replace', nextBoundsOnMap);
          if ((this.vbounds.y1 - this.speed) < this.fence.y1) {
            return this.viewport.translateBySide('y1', this.mbounds.y1 - this.viewportPadding);
          }
        }
      },
      moveDown: function() {
        var map, mapHeight, nextBoundsOnMap, y, _base;
        nextBoundsOnMap = this.mbounds.withTranslation({
          y: this.speed
        });
        if (y = this.mapCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) {
          this.translateBySide('y2', y);
          return;
        }
        mapHeight = this.map.height;
        if ((this.viewport.bounds.y2 + this.speed) > mapHeight) {
          if (map = typeof (_base = this.map).getAreaDown === "function" ? _base.getAreaDown() : void 0) {
            return this.map.loadArea(map);
          } else {
            this.viewport.translateBySide('y2', mapHeight);
            if (nextBoundsOnMap.y2 > mapHeight) {
              return this.doToMapBounds('translateBySide', 'y2', mapHeight);
            } else {
              return this.doToMapBounds('replace', nextBoundsOnMap);
            }
          }
        } else {
          this.doToMapBounds('replace', nextBoundsOnMap);
          if ((this.vbounds.y2 + this.speed) > this.fence.y2) {
            return this.viewport.translateBySide('y2', this.mbounds.y2 + this.viewportPadding);
          }
        }
      },
      _initFence: function() {
        return this.fence = game.Bounds.rect(0, 0, game.viewport.width, game.viewport.height).withScale(this.viewportPadding);
      }
    });
    player.init('link2x', 34, 48);
    player.speed = 4;
    player.addState('moveLeft', [0, 1, 2, 3, 4, 5, 6, 7], {
      frameDuration: 2,
      doesRepeat: true,
      "do": 'moveLeft'
    });
    player.addState('moveRight', [8, 9, 10, 11, 12, 13, 14, 15], {
      frameDuration: 2,
      doesRepeat: true,
      "do": 'moveRight'
    });
    player.addState('moveDown', [16, 17, 18, 19, 20, 21, 22], {
      frameDuration: 2,
      doesRepeat: true,
      "do": 'moveDown'
    });
    player.addState('moveUp', [23, 24, 25, 26, 27, 28], {
      frameDuration: 2,
      doesRepeat: true,
      "do": 'moveUp'
    });
    player.addState('idleLeft', [0], {
      frameDuration: 2,
      doesRepeat: true
    });
    player.addState('idleRight', [8], {
      frameDuration: 2,
      doesRepeat: true
    });
    player.addState('idleDown', [19], {
      frameDuration: 2,
      doesRepeat: true
    });
    player.addState('idleUp', [23], {
      frameDuration: 2,
      doesRepeat: true
    });
    return player;
  });

}).call(this);
