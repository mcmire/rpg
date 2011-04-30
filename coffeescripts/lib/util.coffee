# Stolen from zepto.js
onDocumentReady = (callback) ->
  callback() if document.readyState == 'complete' || document.readyState == 'loaded'
  document.addEventListener 'DOMContentLoaded', callback, false
  return this

window.$ = (id) ->
  if typeof id == "function"
    onDocumentReady(id)
  else
    document.getElementById(id)

Object.extend = (obj, props) ->
  obj[key] = val for own key, val of props || {}