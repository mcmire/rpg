
define 'common', ->
  imagesPath: '/images'
  resolveImagePath: (path) ->
    "#{@imagesPath}/#{path}"

