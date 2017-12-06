/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'show-video';

  var video = document.querySelector('#video');
  var canvas = document.querySelector('canvas');

  function playVideo(source) {
    return new Promise(function (resolve, reject) {
      function onPlaying() {
        video.removeEventListener('playing', onPlaying);

        resolve(video);
      }

      video.srcObject = source;

      video.addEventListener('playing', onPlaying);
    });
  }

  register(NAME, function (source) {
    var context = this;

    context.events.on('video-ready', function (source) {
      playVideo(source)
      .then(function (videoElem) {
        context.events.emit('video-playing', videoElem);
      })
      .catch(function (err) {
        context.events.emit('error', err);
      });
    });

    return function destroy() {};
  });
}(window.registerModule));
