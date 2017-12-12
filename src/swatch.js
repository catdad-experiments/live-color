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

    context.events.on('video-playing', function () {
      videoIsPlaying = true;
    });

    context.events.on('stop-video', function () {
      videoIsPlaying = false;
    });

    context.events.on('color-change', function (ev) {
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
    });

    color.addEventListener('click', function () {
      if (videoIsPlaying) {
        context.events.emit('stop-video');
      } else {
        context.events.emit('start-video');
      }
    });

    return function destroy() {};
  });
}(window.registerModule));
