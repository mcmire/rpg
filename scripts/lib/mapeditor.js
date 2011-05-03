(function(window, document, $, _, undefined) {
  window.Editor = (function(){
    var editor = {};

    editor.canvas = null;
    editor.ctx = null;
    editor.imagePath = "images";
    editor.activeTool = 'dirt'

    editor.map = {
      data: [],
      tiles: {
        names: ['grass', 'snow', 'water', 'dirt'],
        instances: {}
      },
      location: {
        x: 0,
        y: 0,
        i: 0,
        j: 0
      }
    }

    editor.init = function(){
      var self = this;
      self._preloadImages();
      self._drawCanvas();
      self._drawGrid();
      self._drawTileSelector();
      self._addEvents();
    };

    editor._preloadImages = function(){
      var self = this;
      _.each(self.map.tiles.names, function(tile){
        var image = new Image(32, 32);
        image.src = self.imagePath +'/' + tile + '.gif';
        self.map.tiles.instances[tile] = image;
      })
    };

    editor._drawCanvas = function(){
      var self = this;
      self.canvas = document.createElement("canvas");
      self.ctx = self.canvas.getContext("2d");
      self.canvas.width = 960;
      self.canvas.height = 800;
      document.body.appendChild(self.canvas);
    };

    editor._drawTileSelector = function(){
      var self = this;
      var ul = document.createElement("ul");
      document.body.appendChild(ul);
      var li, img;
      _.each(self.map.tiles.names, function(tile, i){
        li = document.createElement("li");
        img = document.createElement("img");
        img.src = self.imagePath + '/' + tile + '.gif';
        img.setAttribute('class', 'tile');
        img.setAttribute('id', tile)
        ul.appendChild(li);
        li.appendChild(img);
      });
    }

    editor._drawGrid = function(){
      var self = this;
      var ctx = self.ctx;
      ctx.save();
      ctx.strokeStyle = "#eee"
      for(var x=0.5; x < self.canvas.width; x += 32){
        ctx.moveTo(x, 0);
        ctx.lineTo(x, self.canvas.height);
      }

      for(var y=0.5; y < self.canvas.height; y += 32){
        ctx.moveTo(0, y);
        ctx.lineTo(self.canvas.width, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    editor._addEvents = function(){
      var self = this;
      var canvas = self.canvas;
      bean.add(canvas, 'click', function(event){
        var x = Math.floor((event.pageX - canvas.offsetLeft)/32)*32;
        var y = Math.floor((event.pageY - canvas.offsetTop)/32)*32;
        self.ctx.drawImage(self.map.tiles.instances[self.activeTool], x, y);
      })
      var tiles = document.getElementsByClassName('tile');
      bean.add(document, tiles, 'click', function(event){
        _.each(tiles,function(tile){
          tile.className = 'tile';
        });
        this.className += ' active';
        self.activeTool = this.id
      });
    }
    return editor;
  })();

  $(function(){
    Editor.init();
  })
})(window, window.document, window.$, window._);
