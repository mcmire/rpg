# Returns a random number between min (inclusive) and max (exclusive).
# Copied from the MDC wiki
#
Math.randomFloat = (min, max) ->
  Math.random() * (max - min) + min

# Returns a random integer between min (inclusive) and max (exclusive?).
# Using Math.round() will give you a non-uniform distribution!
# Copied from the MDC wiki
#
Math.randomInt = (min, max) ->
  Math.floor(Math.random() * (max - min + 1)) + min

# <http://stackoverflow.com/questions/610406/javascript-printf-string-format>
#
String.format = (str, args...) ->
  for i in [0..args.length]
    regexp = new RegExp("\\{"+i+"\\}", "gi")
    str = str.replace(regexp, args[i])
  return str

String.capitalize = (str) ->
  return "" unless str
  str[0].toUpperCase() + str.slice(1)