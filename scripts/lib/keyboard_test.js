(function(window, document, $, _, undefined) {

  var pressedKeys = {};

  bean.add(window, {
    keydown: function(event) {
      keyCodeField.value = event.keyCode;
      if (event.shiftKey) shiftCheckbox.checked = true;
      if (event.altKey)   altCheckbox.checked   = true;
      if (event.ctrlKey)  ctrlCheckbox.checked  = true;
      if (event.metaKey)  metaCheckbox.checked  = true;
      pressedKeys[event.keyCode] = true;
    },
    keyup: function(event) {
      keyCodeField.value = "";
      delete pressedKeys[event.keyCode];
      if (_.keys(pressedKeys).length == 0) {
        shiftCheckbox.checked = false;
        altCheckbox.checked   = false;
        ctrlCheckbox.checked  = false;
        metaCheckbox.checked  = false;
      }
    }
  })
  
  var p = document.createElement("p");
    p.innerHTML += "Key code:"
    var keyCodeField = document.createElement("input")
      keyCodeField.type = "text";
    p.appendChild(keyCodeField);
  document.body.appendChild(p);
  
  var p = document.createElement("p");
    var label = document.createElement("label");
      label.innerHTML += "shift";
      var shiftCheckbox = document.createElement("input");
        shiftCheckbox.type = "checkbox";
      label.appendChild(shiftCheckbox);
    p.appendChild(label);
    
    var label = document.createElement("label");
      label.innerHTML += "alt";
      var altCheckbox = document.createElement("input");
        altCheckbox.type = "checkbox";
      label.appendChild(altCheckbox);
    p.appendChild(label);
    
    var label = document.createElement("label");
      label.innerHTML += "ctrl";
      var ctrlCheckbox = document.createElement("input");
        ctrlCheckbox.type = "checkbox";
      label.appendChild(ctrlCheckbox);
    p.appendChild(label);
    
    var label = document.createElement("label");
      label.innerHTML += "meta";
      var metaCheckbox = document.createElement("input");
        metaCheckbox.type = "checkbox";
      label.appendChild(metaCheckbox);
    p.appendChild(label);
  document.body.appendChild(p);
  
})(window, window.document, window.$, window._);