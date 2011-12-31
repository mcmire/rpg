# TODO

* Do not attempt to draw entities which are off the screen (out of the viewport)

* Fix sprites for the player and the enemy

* CollisionLayer: Merge getBlocking\*Edge methods into one

* CollisionLayer: Instead of a @collisionBoxes array, store @collisionBoxesByX
  and @collisionBoxesByY arrays. These are arrays sorted by x1 and y1, and as
  the player moves through the world and crosses X and Y coordinates of boxes,
  pointers would be updated which point to boxes in the two arrays. So we have
  pointers that point to the last boxes that the player has crossed (in the X
  and Y directions). Since the collision box arrays are sorted, the next box
  that the player reaches will be next in the array after the pointer, so we
  don't have to search the entire array every time.
