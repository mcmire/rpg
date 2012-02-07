game = (window.game ||= {})

meta = game.meta2
Image = game.Image

images = {}
numImages = 0
numLoaded = 0

add = (path, width, height) ->
  img = images[path] = Image.create(path, width, height)
  img.onLoad -> numLoaded++
  numImages++

load = ->
  img.load() for path, img of images

isLoaded = ->
  numLoaded == numImages

#---

add 'dirt1', 16, 16
add 'dirt2', 16, 16
add 'dirt3', 16, 16
add 'entrance_skull', 32, 16
add 'flower', 48, 16
add 'grass_dirt_edge01', 16, 16
add 'grass_dirt_edge02', 16, 16
add 'grass_dirt_edge03', 16, 16
add 'grass_dirt_edge04', 16, 16
add 'grass_dirt_edge05', 16, 16
add 'grass_dirt_edge06', 16, 16
add 'grass_dirt_edge07', 16, 16
add 'grass_dirt_edge08', 16, 16
add 'grass_dirt_edge09', 16, 16
add 'grass_dirt_edge10', 16, 16
add 'grass_dirt_edge11', 16, 16
add 'grass_dirt_edge12', 16, 16
add 'grass_dirt_edge13', 16, 16
add 'grass_dirt_edge14', 16, 16
add 'grass1', 16, 16
add 'grass2', 16, 16
add 'hill_e', 48, 32
add 'hill_n', 32, 32
add 'hill_ne1', 16, 32
add 'hill_ne2', 32, 16
add 'hill_nw1', 16, 32
add 'hill_nw2', 32, 16
add 'hill_s', 32, 80
add 'hill_se1', 16, 80
add 'hill_se2', 16, 64
add 'hill_se3', 16, 64
add 'hill_se4', 16, 32
add 'hill_sw1', 16, 80
add 'hill_sw2', 16, 64
add 'hill_sw3', 16, 64
add 'hill_sw4', 16, 32
add 'hill_w', 48, 16
add 'post1', 16, 32
add 'post2', 16, 32
add 'post3', 16, 32
add 'links_house', 208, 200
add 'rock1', 16, 16
add 'rock2', 16, 16

add 'link2x', 34, 1440

#---

game.imageCollection =
  get: (name) -> images[name]
  load: load
  isLoaded: isLoaded

window.scriptLoaded('app/images')
