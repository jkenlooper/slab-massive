/* global Element */
function fullscreen (button, element) { // eslint-disable-line no-unused-vars
  function toggleFullScreen () {
    if (!document.mozFullScreenElement && !document.fullscreenElement && !document.webkitFullscreenElement) {
      if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else {
        document.webkitExitFullscreen()
      }
    }
  }

  button.addEventListener('click', function (e) {
    toggleFullScreen()
  }, false)

  // No public methods for now
  return {
  }
}
