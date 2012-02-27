common = (window.common ||= {})

$.v.extend common,
  imagesPath: '/images'
  resolveImagePath: (path) ->
    "#{@imagesPath}/#{path}"

