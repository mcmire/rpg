window.Canvas = {}

Canvas.tileSize = 16
Canvas.tickInterval = 150
Canvas.numTilesWidth = 48
Canvas.numTilesHeight = 32
Canvas.width = Canvas.tileSize * Canvas.numTilesWidth
Canvas.height = Canvas.tileSize * Canvas.numTilesHeight

Canvas.imagePath = "images"
Canvas.imageNames = ["grass"]

Object.extend Canvas,
  init: ->
    self = this
    
    canvas = self.canvas = document.createElement("canvas")
    canvas.width = self.width
    canvas.height = self.height
    document.body.appendChild(canvas)
    
    self.canvas = canvas
    self.ctx    = canvas.getContext("2d")
    
    self.delayDrawing = true
    self._preloadImages()
  
  run: ->
    self = this
    setTimeout (-> self._redraw()), self.tickInterval
    #self._redraw()
  
  _preloadImages: ->
    self = this
    images = []
    for i in [0...self.imageNames.length]
      do (i) ->
        name = self.imageNames[i]
        image = new Image(self.tileSize, self.tileSize)
        image.src = self.imagePath + "/" + name + ".gif"
        image.onload = ->
          self.delayDrawing = false if i == self.imageNames.length-1
        images.push(image)
    self.images = images
  
  _redraw: ->
    self = this
    return if self.delayDrawing
    for i in [0...self.numTilesWidth]
      for j in [0...self.numTilesHeight]
        self.ctx.drawImage(self.images[0], i*self.tileSize, j*self.tileSize)

$(->
  Canvas.init()
  Canvas.run()
)