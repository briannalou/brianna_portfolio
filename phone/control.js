document.addEventListener('DOMContentLoaded', function() {

    const light = document.getElementById('light');
    
    const toggleOpacityBtn = document.getElementById('toggle-opacity');
    const translateZSlider = document.getElementById('translateZ-slider');
    const bgcolorPicker = document.getElementById('bgcolor-picker');
    const blendModeSelect = document.getElementById('blend-mode-select');
    const controlPanel = document.getElementById('control-panel');
    const togglePanelBtn = document.getElementById('toggle-panel');
// 
// 
    toggleOpacityBtn.addEventListener('click', function() {
      const currentOpacity = parseFloat(getComputedStyle(light).opacity);
      light.style.opacity = (currentOpacity === 1) ? "0" : "1";
    });

    translateZSlider.addEventListener('input', function() {
      const zValue = translateZSlider.value;
      light.style.transform = `translate(-50%, -50%) translateZ(${zValue}px)`;
    });

    bgcolorPicker.addEventListener('input', function() {
      light.style.backgroundColor = bgcolorPicker.value;
    });

    blendModeSelect.addEventListener('change', function() {
      light.style.mixBlendMode = blendModeSelect.value;
    });

    togglePanelBtn.addEventListener('click', function() {
      const body = document.getElementById('control-panel-body');
      if (body.hidden) {
        body.hidden = false;
        togglePanelBtn.textContent = "–";
      } else {
        body.hidden = true;
        togglePanelBtn.textContent = "+";
      }
    });
  });