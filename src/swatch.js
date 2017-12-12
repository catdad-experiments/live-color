/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'swatch';

  var color = document.querySelector('#color');
  var colorMeta = document.querySelector('#color-meta');

  // Utils
  function renderMustache(str, obj) {
    return Object.keys(obj).reduce(function (memo, key) {
      var value = obj[key];
      var regex = new RegExp('\\$\\{' + key + '\\}', 'g');

      return memo.replace(regex, value);
    }, str);
  }

  function init() {
    color.classList.remove('hide');
  }

  function destroy() {
    color.classList.add('hide');
  }

  register(NAME, function () {
    var context = this;
    var initialized = false;

    var videoIsPlaying = false;

    function onVideoPlaying() {
      videoIsPlaying = true;
    }

    function onVideoStopped() {
      videoIsPlaying = false;
    }

    function onColorChange(ev) {
      if (!initialized) {
        init();
        initialized = true;
      }

      // set the background of the hero color
      color.style.backgroundColor = 'rgb(' + ev.color.r + ',' + ev.color.g + ',' + ev.color.b + ')';

      // update the meta box
      colorMeta.innerHTML = '';
      colorMeta.appendChild(
        document.createTextNode(
          renderMustache('R: ${r}, G: ${g}, B: ${b}', ev.color)
        )
      );
    }

    function onColorClick() {
      if (videoIsPlaying) {
        context.events.emit('stop-video');
      } else {
        context.events.emit('start-video');
      }
    }

    context.events.on('video-playing', onVideoPlaying);
    context.events.on('stop-video', onVideoStopped);
    context.events.on('color-change', onColorChange);

    color.addEventListener('click', onColorClick);

    return function destroy() {
      context.events.off('video-playing', onVideoPlaying);
      context.events.off('stop-video', onVideoStopped);
      context.events.off('color-change', onColorChange);

      color.removeEventListener('click', onColorClick);
    };
  });
}(window.registerModule));
