(function() {
  var __slice = Array.prototype.slice;

  define('game.viewport', function() {
    var attachable, meta, tickable, viewport, _ref;
    meta = require('meta');
    _ref = require('roles'), attachable = _ref.attachable, tickable = _ref.tickable;
    viewport = meta.def(attachable, {
      width: 512,
      height: 448,
      init: function(core, player) {
        this.core = core;
        this.player = player;
        this.setParentElement(this.core.getElement());
        this.setElement($('<div id="viewport" />').css({
          width: this.width,
          height: this.height
        }));
        this.bounds = require('game.Bounds').rect(0, 0, this.width, this.height);
        return this;
      },
      attach: function() {
        this._super();
        this.getParentElement().append('<p>You can use the arrow keys to move around (WASD also works too).</p>');
        this.getParentElement().append("<p>Walk around the map! Explore! (Yeah, there isn't much to see, I guess.)</p>");
        return this.getParentElement().append("<p>Also try the <a href=\"/editor\">cool map editor</a> (in progress, of course).</p>");
      },
      setMap: function(map) {
        this.currentMap = map;
        return this._setBounds();
      },
      unsetMap: function() {
        return this.currentMap.detach();
      },
      translate: function() {
        var args, _ref2;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref2 = this.bounds).translate.apply(_ref2, args);
        return this;
      },
      translateBySide: function(side, value) {
        var ret;
        ret = this.bounds.translateBySide(side, value);
        return ret;
      },
      inspect: function() {
        return JSON.stringify({
          "bounds": this.bounds.inspect()
        });
      },
      debug: function() {
        return console.log("viewport.bounds = " + (this.bounds.inspect()));
      },
      _setBounds: function() {
        var p, pb, phh, pwh, vhh, vwh, x1, y1;
        p = this.core.player;
        pb = p.mbounds;
        pwh = Math.round(p.width / 2);
        phh = Math.round(p.height / 2);
        vwh = Math.round(this.width / 2);
        vhh = Math.round(this.height / 2);
        x1 = pb.x1 + pwh - vwh;
        if (x1 < 0) x1 = 0;
        y1 = pb.y1 + phh - vhh;
        if (y1 < 0) y1 = 0;
        return this.bounds.anchor(x1, y1);
      }
    });
    return viewport;
  });

}).call(this);
