
define(function(require) {
  var DIRECTIONS, DIRECTION_KEYS, KEYS, KEY_DIRECTIONS, Mob, Player, dir, eventable, keyCode, keyboard, util, _i, _j, _len, _len2, _ref;
  util = require('app/util');
  Mob = require('app/mob');
  eventable = require('app/roles').eventable;
  keyboard = require('app/keyboard');
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
  Player = Mob.extend('game.Player', eventable, {
    statics: {
      image: 'link2x.gif',
      width: 34,
      height: 48,
      speed: 4
    },
    members: {
      __plugged__: function(core) {
        return core.collisionLayer.add(this);
      },
      init: function(core) {
        this.viewportPadding = 30;
        this._super(core);
        this.keyTracker = new keyboard.KeyTracker(KEYS);
        this.addEvents();
        return this.setState('idleRight');
      },
      _initFence: function() {
        return this.fence = this.viewport.bounds.withScale(this.viewportPadding);
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
          state = this.state.name.replace('move', 'idle');
        }
        if (state !== this.state.name) this.setState(state);
        return this._super();
      },
      moveLeft: function() {
        var distanceFromFence, nextBoundsOnMap, x;
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          x: -this.speed
        });
        if (x = this.allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) {
          this.bounds.onMap.translateBySide('x1', x);
          return;
        }
        if ((this.viewport.bounds.x1 - this.speed) < 0) {
          this.viewport.translateBySide('x1', 0);
          if (nextBoundsOnMap.x1 < 0) {
            return this.bounds.onMap.translateBySide('x1', 0);
          } else {
            return this.bounds.onMap.translate({
              x: -this.speed
            });
          }
        } else {
          this.bounds.onMap.translate({
            x: -this.speed
          });
          if ((this.bounds.inViewport.x1 - this.speed) < this.fence.x1) {
            distanceFromFence = this.bounds.inViewport.x1 - this.fence.x1;
            return this.viewport.translate({
              x: -(this.speed - distanceFromFence)
            });
          }
        }
      },
      moveRight: function() {
        var distanceFromFence, mapWidth, nextBoundsOnMap, x;
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          x: this.speed
        });
        if (x = this.allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) {
          this.bounds.onMap.translateBySide('x2', x);
          return;
        }
        mapWidth = this.map.width;
        if ((this.viewport.bounds.x2 + this.speed) > mapWidth) {
          this.viewport.translateBySide('x2', mapWidth);
          if (nextBoundsOnMap.x2 > mapWidth) {
            return this.bounds.onMap.translateBySide('x2', mapWidth);
          } else {
            return this.bounds.onMap.translate({
              x: this.speed
            });
          }
        } else {
          this.bounds.onMap.translate({
            x: this.speed
          });
          if ((this.bounds.inViewport.x2 + this.speed) > this.fence.x2) {
            distanceFromFence = this.fence.x2 - this.bounds.inViewport.x2;
            return this.viewport.translate({
              x: this.speed - distanceFromFence
            });
          }
        }
      },
      moveUp: function() {
        var distanceFromFence, nextBoundsOnMap, y;
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          y: -this.speed
        });
        if (y = this.allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) {
          this.bounds.onMap.translateBySide('y1', y);
          return;
        }
        if ((this.viewport.bounds.y1 - this.speed) < 0) {
          this.viewport.translateBySide('y1', 0);
          if (nextBoundsOnMap.y1 < 0) {
            return this.bounds.onMap.translateBySide('y1', 0);
          } else {
            return this.bounds.onMap.translate({
              y: -this.speed
            });
          }
        } else {
          this.bounds.onMap.translate({
            y: -this.speed
          });
          if ((this.bounds.inViewport.y1 - this.speed) < this.fence.y1) {
            distanceFromFence = this.bounds.inViewport.y1 - this.fence.y1;
            return this.viewport.translate({
              y: -(this.speed - distanceFromFence)
            });
          }
        }
      },
      moveDown: function() {
        var distanceFromFence, mapHeight, nextBoundsOnMap, y;
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          y: this.speed
        });
        if (y = this.allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) {
          this.translateBySide('y2', y);
          return;
        }
        mapHeight = this.map.height;
        if ((this.viewport.bounds.y2 + this.speed) > mapHeight) {
          this.viewport.translateBySide('y2', mapHeight);
          if (nextBoundsOnMap.y2 > mapHeight) {
            return this.bounds.onMap.translateBySide('y2', mapHeight);
          } else {
            return this.bounds.onMap.translate({
              y: this.speed
            });
          }
        } else {
          this.bounds.onMap.translate({
            y: this.speed
          });
          if ((this.bounds.inViewport.y2 + this.speed) > this.fence.y2) {
            distanceFromFence = this.fence.y2 - this.bounds.inViewport.y2;
            return this.viewport.translate({
              y: this.speed - distanceFromFence
            });
          }
        }
      }
    }
  });
  Player.addState('moveLeft', {
    duration: 2,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    repeat: true,
    move: true
  });
  Player.addState('moveRight', {
    duration: 2,
    frames: [8, 9, 10, 11, 12, 13, 14, 15],
    repeat: true,
    move: true
  });
  Player.addState('moveDown', {
    duration: 2,
    frames: [16, 17, 18, 19, 20, 21, 22],
    repeat: true,
    move: true
  });
  Player.addState('moveUp', {
    duration: 2,
    frames: [23, 24, 25, 26, 27, 28],
    repeat: true,
    move: true
  });
  Player.addState('idleLeft', {
    duration: 2,
    frames: [0],
    repeat: true
  });
  Player.addState('idleRight', {
    duration: 2,
    frames: [8],
    repeat: true
  });
  Player.addState('idleDown', {
    duration: 2,
    frames: [19],
    repeat: true
  });
  Player.addState('idleUp', {
    duration: 2,
    frames: [23],
    repeat: true
  });
  return Player;
});
