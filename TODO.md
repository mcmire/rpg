# TODO

* Use [keymaster](https://github.com/madrobby/keymaster) for detecting keys?

* Store images at original size, then on loading images, use Canvas to read
  images pixel by pixel and then encode them in memory as an array of arrays (or
  Pixel objects). This way we can easily render images at an arbitrary size
  (this will allow zooming in the editor).

* Don't use Valentine so much -- if this is going to only work in newer browsers
  then we can use ES5 .forEach, .reduce, etc.

* Use Rack middleware for compiling Coffee and Sass on the fly
  (performance is not important for this app)

## Game

* Fix sprites for the player and the enemy

* Rename Bounds to Box, to prevent intersectsWith/intersectWith

* The "framed objects" - these should be a list of objects that are 32px (4
  tiles) outside of the viewport, in case any objects are sitting right outside
  of view and move into view

* There's probably no need for a separate collision bounds -- just change
  Bounds#intersectsWith so that it allows objects to encroach 8px into a
  collision box on the bottom edge

## Editor

* INTERNAL: Use editor-map-object for all objects not just tiles

* FEATURE: Add ability to set the background color of a map

* FEATURE: Add ability to select multiple objects so you can move them as a
  group

* FEATURE: Remember the last tool used in a layer

* INTERNAL: For map objects, group the $elem and the object together,
  everywhere, as one MapObject, and clean up stuff just like fills

* INTERNAL: Bind viewport events to viewport.$elem rather than viewport.$map

* FEATURE: When dragging a map object (tile or fill), instantly put its z-index
  above the others (or just move it after every one)

* FEATURE: Add ability to add a new map. To do this, double-click on "Add new
  map" in the sidebar. A modal will appear with textboxes for the desired
  dimensions of the map, and when the modal is submitted a new canvas is created
  and loaded into the viewport.

* FEATURE: Add entities layer

#---

* NICE-TO-HAVE: Snap the selection box to the nearest grid guide, but not by
  rounding -- if cursor is within 5 pixels of a guide, snap it otherwise do
  nothing

* NICE-TO-HAVE: Add undo/redo -- this will require refactoring all the tools
  into a more object-oriented approach

* NICE-TO-HAVE: Add ability to dupe an object without having to drag it again
  all the way from the sidebar
