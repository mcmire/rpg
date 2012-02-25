(function() {
  var DIRECTIONS, Enemy, Grob, game, meta, util;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  util = game.util;

  Grob = game.Grob;

  /* FIXME
  */

  DIRECTIONS = 'right down left up'.split(' ');

  Enemy = Grob.cloneAs('game.Enemy');

  Enemy.addState('moveDown', [0, 1], {
    frameDuration: 4,
    "do": 'moveDown',
    doesRepeat: true
  });

  Enemy.addState('moveRight', [4, 5], {
    frameDuration: 4,
    "do": 'moveRight',
    doesRepeat: true
  });

  Enemy.addState('moveLeft', [8, 9], {
    frameDuration: 4,
    "do": 'moveLeft',
    doesRepeat: true
  });

  Enemy.addState('moveUp', [12, 13], {
    frameDuration: 4,
    "do": 'moveUp',
    doesRepeat: true
  });

  Enemy.addState('upToLeft', [12, 14], {
    frameDuration: 24,
    then: 'moveLeft'
  });

  Enemy.addState('downToLeft', [0, 3], {
    frameDuration: 24,
    then: 'moveLeft'
  });

  Enemy.addState('upToRight', [12, 15], {
    frameDuration: 24,
    then: 'moveRight'
  });

  Enemy.addState('downToRight', [0, 2], {
    frameDuration: 24,
    then: 'moveRight'
  });

  Enemy.addState('leftToUp', [8, 11], {
    frameDuration: 24,
    then: 'moveUp'
  });

  Enemy.addState('rightToUp', [4, 6], {
    frameDuration: 24,
    then: 'moveUp'
  });

  Enemy.addState('leftToDown', [8, 10], {
    frameDuration: 24,
    then: 'moveDown'
  });

  Enemy.addState('rightToDown', [4, 7], {
    frameDuration: 24,
    then: 'moveDown'
  });

  Enemy.extend({
    __plugged__: function(core) {
      return core.collisionLayer.add(this);
    },
    _directionChangeNeeded: false,
    init: function() {
      this._super('enemy2x.gif', 40, 56, 3);
      this.setState('moveRight');
      return this._chooseSequenceLength();
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(100, 100, 300, 300);
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
      x = this.allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap) || this.fence.getInnerLeftEdgeBlocking(nextBoundsOnMap);
      if (x) {
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
      x = this.allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap) || this.fence.getInnerRightEdgeBlocking(nextBoundsOnMap);
      if (x) {
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
      y = this.allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap) || this.fence.getInnerTopEdgeBlocking(nextBoundsOnMap);
      if (y) {
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
      y = this.allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap) || this.fence.getInnerBottomEdgeBlocking(nextBoundsOnMap);
      if (y) {
        this.bounds.onMap.translateBySide('y2', y);
        return this._directionChangeNeeded = true;
      } else {
        return this.bounds.onMap.replace(nextBoundsOnMap);
      }
    },
    postdraw: function(ctx) {
      if (this._directionChangeNeeded || this.numSeqFrameDraws === this.sequenceLength) {
        this._directionChangeNeeded = false;
        return this._chooseAnotherDirection();
      } else {
        return this._super(ctx);
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
  });

  game.Enemy = Enemy;

  window.numScriptsLoaded++;

}).call(this);
