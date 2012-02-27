
# Delete the given value in the array.
#
Array.prototype.delete = (value) ->
  @deleteAt(this.indexOf(value))

# Delete the value at the given index in the array.
#
Array.prototype.deleteAt = (index) ->
  @splice(index, 1)
