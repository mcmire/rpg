# TODO

* Use [keymaster](https://github.com/madrobby/keymaster) for detecting keys?

* Store images at original size, then on loading images, use Canvas to read
  images pixel by pixel and then encode them in memory as an array of arrays (or
  Pixel objects). This way we can easily render images at an arbitrary size
  (this will allow zooming in the editor).

* Don't use Valentine so much -- if this is going to only work in newer browsers
  then we can use ES5 .forEach, .reduce, etc.

## Game

* Fix sprites for the player and the enemy

* Use Rack middleware for compiling Coffee and Sass on the fly
  (performance is not important for this app)

* Rename Bounds to Box, to prevent intersectsWith/intersectWith

* The "framed objects" - these should be a list of objects that are 32px (4
  tiles) outside of the viewport, in case any objects are sitting right outside
  of view and move into view

* There's probably no need for a separate collision bounds -- just change
  Bounds#intersectsWith so that it allows objects to encroach 8px into a
  collision box on the bottom edge

## Editor

* In the default view, there are two panes, the sidebar with a list of available
  maps and the viewport that will display an open map. When a map is loaded, a
  third pane appears with objects for adding to the map.

* To add a new map, double-click on "Add new map" in the sidebar. A modal will
  appear with textboxes for the desired dimensions of the map, and when the
  modal is submitted a new canvas is created and loaded into the viewport.

* Maps are scrollable a la Google Maps - just drag the map to see another area.

* There are two layers on a map: foreground and background. These can be
  switched with a small dropdown in the upper right hand corner of the viewport.
  Switching to the foreground layer will render the background as washed out,
  and vice versa. In background mode, the right-hand pane lists images and
  sprites, in foreground mode the right-hand pane lists collidable scenery,
  items, and mobs.

* To add an object to the map, just drag it over from the objects pane.

* To move an object already on the map, just drag it to a new location. Objects
  are snapped to an 8px grid (which is always overlaid on top of the map). Two
  objects cannot share the same space. If an object being dragged is hovering
  over an invalid location, it will turn red (a la the icons on the home screen
  in Android); lifting off would then cancel the drag.

* An open map is saved automagically, as soon as you make a change.

* Add a selection tool -- so if you want to move two tiles as a group (say,
  Link's house AND the door), you can do that.

* Add a threshold for dragging -- maybe about 3 pixels

* Add undo/redo -- this will require refactoring all the tools into a more
  object-oriented approach

* Add ability to dupe an object without having to drag it again all the way from
  the sidebar

* For map objects, group the $elem and the object together, everywhere, as one
  MapObject

* Snap the selection box to the nearest grid guide, but not by rounding -- if
  cursor is within 5 pixels of a guide, snap it otherwise do nothing

* Bind viewport events to viewport.$elem rather than viewport.$map
