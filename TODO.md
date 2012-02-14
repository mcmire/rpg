# TODO

* Do not attempt to draw entities which are off the screen (out of the viewport)

* Fix sprites for the player and the enemy

* CollisionLayer: Instead of a @collisionBoxes array, store @collisionBoxesByX
  and @collisionBoxesByY arrays. These are arrays sorted by x1 and y1, and as
  the player moves through the world and crosses X and Y coordinates of boxes,
  pointers would be updated which point to boxes in the two arrays. So we have
  pointers that point to the last boxes that the player has crossed (in the X
  and Y directions). Since the collision box arrays are sorted, the next box
  that the player reaches will be next in the array after the pointer, so we
  don't have to search the entire array every time.

* Use Rack middleware for compiling Coffee and Sass on the fly
  (performance is not important for this app)

* Rename Bounds to Box, to prevent intersectsWith/intersectWith

* When viewport is adjusted, recompile "framed objects" or list of objects
  within view - unfortunately this means that for each object within view, *its*
  objects array, its awareness of all other objects within view, has to be
  updated. Which means we need to update the "framed objects" array, not replace
  it - if we do this then the objects should be automatically updated

* The "framed objects" - these should be a list of objects that are 32px (4
  tiles) outside of the viewport, in case any objects are sitting right outside
  of view and move into view

* The way that objects are stored (first by Y, then by X, in nested arrays)
  seems a bit excessive. Is there a way to do a binary search on two values
  rather than one? Or should we even worry about sorting objects by X since that
  doesn't matter in terms of drawing the objects?

* There's probably no need for a separate collision bounds -- just change
  Bounds#intersectsWith so that it allows objects to encroach 8px into a
  collision box on the bottom edge
