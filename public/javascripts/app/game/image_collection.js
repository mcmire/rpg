(function() {

  define('game.imageCollection', function() {
    var Image, add, addObject, addTile, each, get, images, isLoaded, load, meta, numImages, numLoaded;
    meta = require('meta');
    Image = require('game.Image');
    images = {};
    numImages = 0;
    numLoaded = 0;
    add = function(name, path, width, height) {
      var img;
      img = images[name] = Image.create(name, path, width, height);
      img.onLoad(function() {
        return numLoaded++;
      });
      return numImages++;
    };
    addTile = function(name, width, height) {
      return add(name, "game/tiles/" + name, width, height);
    };
    addObject = function(name, width, height) {
      return add(name, "game/objects/" + name, width, height);
    };
    get = function(name) {
      return images[name] || (function() {
        throw new Error("Couldn't find image " + name + "!");
      })();
    };
    load = function() {
      var img, name, _results;
      _results = [];
      for (name in images) {
        img = images[name];
        _results.push(img.load());
      }
      return _results;
    };
    isLoaded = function() {
      return numLoaded === numImages;
    };
    each = function(fn) {
      var names;
      names = $.v.keys(images).sort();
      return $.v.each(names, function(name) {
        return fn(images[name]);
      });
    };
    addTile('8stone', 32, 32);
    addTile('dirt1', 16, 16);
    addTile('dirt2', 16, 16);
    addTile('dirt3', 16, 16);
    addTile('entrance_skull', 32, 16);
    addTile('flower', 16, 48);
    addTile('grass_dirt_edge01', 16, 16);
    addTile('grass_dirt_edge02', 16, 16);
    addTile('grass_dirt_edge03', 16, 16);
    addTile('grass_dirt_edge04', 16, 16);
    addTile('grass_dirt_edge05', 16, 16);
    addTile('grass_dirt_edge06', 16, 16);
    addTile('grass_dirt_edge07', 16, 16);
    addTile('grass_dirt_edge08', 16, 16);
    addTile('grass_dirt_edge09', 16, 16);
    addTile('grass_dirt_edge10', 16, 16);
    addTile('grass_dirt_edge11', 16, 16);
    addTile('grass_dirt_edge12', 16, 16);
    addTile('grass_dirt_edge13', 16, 16);
    addTile('grass_dirt_edge14', 16, 16);
    addTile('grass1', 16, 16);
    addTile('grass2', 16, 16);
    addTile('hill_e', 48, 32);
    addTile('hill_n', 32, 32);
    addTile('hill_ne1', 16, 32);
    addTile('hill_ne2', 32, 16);
    addTile('hill_nw1', 16, 32);
    addTile('hill_nw2', 32, 16);
    addTile('hill_s', 32, 80);
    addTile('hill_se1', 16, 80);
    addTile('hill_se2', 16, 64);
    addTile('hill_se3', 16, 64);
    addTile('hill_se4', 16, 32);
    addTile('hill_sw1', 16, 80);
    addTile('hill_sw2', 16, 64);
    addTile('hill_sw3', 16, 64);
    addTile('hill_sw4', 16, 32);
    addTile('hill_w', 48, 16);
    addTile('links_door_closed', 32, 32);
    addTile('links_house', 208, 200);
    addTile('post1', 16, 32);
    addTile('post2', 16, 32);
    addTile('post3', 16, 32);
    addTile('rock1', 16, 16);
    addTile('rock2', 16, 16);
    addObject('link2x', 34, 1440);
    return {
      get: get,
      load: load,
      isLoaded: isLoaded,
      each: each
    };
  });

}).call(this);
