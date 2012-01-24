
define(function(require) {
  var Bounds, DIRECTIONS, Enemy, Mob, util;
  util = require('app/util');
  Mob = require('app/mob');
  Bounds = require('app/bounds');
  DIRECTIONS = 'right down left up'.split(' ');
  Enemy = Mob.extend('game.Enemy', {
    statics: {
      image: 'enemy2x.gif',
      width: 40,
      height: 56,
      speed: 3
    },
    members: {
      __plugged__: function(core) {
        return core.collisionLayer.add(this);
      },
      init: function(core) {
        this._super(core);
        this.setState('moveRight');
        this._directionChangeNeeded = false;
        return this._chooseSequenceLength();
      },
      _initFence: function() {
        return this.fence = Bounds.rect(100, 100, 300, 300);
      },
      _initBoundsOnMap: function() {
        var fn, self, _results;
        this._super();
        self = this;
        fn = function() {
          var x1, y1;
          x1 = util.randomInt(self.fence.x1, self.fence.x2);
          y1 = util.randomInt(self.fence.y1, self.fence.y2);
          return self.bounds.onMap.anchor(x1, y1);
        };
        fn();
        if (this.collisionLayer) {
          _results = [];
          while (this.collisionLayer.collidables.intersectsWith(this.bounds.onMap)) {
            _results.push(fn());
          }
          return _results;
        }
      },
      moveLeft: function() {
        var nextBoundsOnMap, x;
        this.direction = 'left';
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          x: -this.speed
        });
        if ((x = this.allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) || (x = this.fence.getInnerLeftEdgeBlocking(nextBoundsOnMap))) {
          this.bounds.onMap.translateBySide('x1', x);
          return this._directionChangeNeeded = true;
        } else {
          return this.bounds.onMap.replace(nextBoundsOnMap);
        }
      },
      moveRight: function() {
        var nextBoundsOnMap, x;
        this.direction = 'right';
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          x: +this.speed
        });
        if ((x = this.allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) || (x = this.fence.getInnerRightEdgeBlocking(nextBoundsOnMap))) {
          this.bounds.onMap.translateBySide('x2', x);
          return this._directionChangeNeeded = true;
        } else {
          return this.bounds.onMap.replace(nextBoundsOnMap);
        }
      },
      moveUp: function() {
        var nextBoundsOnMap, y;
        this.direction = 'up';
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          y: -this.speed
        });
        if ((y = this.allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) || (y = this.fence.getInnerTopEdgeBlocking(nextBoundsOnMap))) {
          this.bounds.onMap.translateBySide('y1', y);
          return this._directionChangeNeeded = true;
        } else {
          return this.bounds.onMap.replace(nextBoundsOnMap);
        }
      },
      moveDown: function() {
        var nextBoundsOnMap, y;
        this.direction = 'down';
        nextBoundsOnMap = this.bounds.onMap.withTranslation({
          y: +this.speed
        });
        if ((y = this.allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) || (y = this.fence.getInnerBottomEdgeBlocking(nextBoundsOnMap))) {
          this.bounds.onMap.translateBySide('y2', y);
          return this._directionChangeNeeded = true;
        } else {
          return this.bounds.onMap.replace(nextBoundsOnMap);
        }
      },
      postdraw: function() {
        if (this._directionChangeNeeded || this.numSeqFrameDraws === this.sequenceLength) {
          this._directionChangeNeeded = false;
          return this._chooseAnotherDirection();
        } else {
          return this._super();
        }
      },
      _chooseAnotherDirection: function() {
        var direction, validDirections;
        validDirections = (function() {
          switch (this.direction) {
            case 'up':
            case 'down':
              return ['left', 'right'];
            case 'left':
            case 'right':
              return ['up', 'down'];
          }
        }).call(this);
        direction = util.capitalize(util.randomItem(validDirections));
        this.setState("" + this.direction + "To" + direction);
        return this._chooseSequenceLength();
      },
      _chooseSequenceLength: function() {
        return this.sequenceLength = util.randomInt(40, 80);
      }
    }
  });
  Enemy.addState('moveDown', {
    frames: [0, 1],
    duration: 4,
    repeat: true,
    move: true
  });
  Enemy.addState('downToRight', {
    frames: [0, 2],
    duration: 24,
    then: 'moveRight'
  });
  Enemy.addState('downToLeft', {
    frames: [0, 3],
    duration: 24,
    then: 'moveLeft'
  });
  Enemy.addState('moveRight', {
    frames: [4, 5],
    duration: 4,
    repeat: true,
    move: true
  });
  Enemy.addState('rightToUp', {
    frames: [4, 6],
    duration: 24,
    then: 'moveUp'
  });
  Enemy.addState('rightToDown', {
    frames: [4, 7],
    duration: 24,
    then: 'moveDown'
  });
  Enemy.addState('moveLeft', {
    frames: [8, 9],
    duration: 4,
    repeat: true,
    move: true
  });
  Enemy.addState('leftToDown', {
    frames: [8, 10],
    duration: 24,
    then: 'moveDown'
  });
  Enemy.addState('leftToUp', {
    frames: [8, 11],
    duration: 24,
    then: 'moveUp'
  });
  Enemy.addState('moveUp', {
    frames: [12, 13],
    duration: 4,
    repeat: true,
    move: true
  });
  Enemy.addState('upToLeft', {
    frames: [12, 14],
    duration: 24,
    then: 'moveLeft'
  });
  Enemy.addState('upToRight', {
    frames: [12, 15],
    duration: 24,
    then: 'moveRight'
  });
  return Enemy;
});
