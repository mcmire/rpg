
define 'mouse_test', ->
  init: ->
    $('#one')
      .bind 'mousedown', ->
        console.log 'mousedown'
      .bind 'mouseup', ->
        console.log 'mouseup'
