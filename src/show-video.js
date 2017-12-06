/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'show-video';

  var video = document.querySelector('#video');
  var canvas = document.querySelector('canvas');

  register(NAME, function (source) {
    return new Promise(function (resolve, reject) {
      function onPlaying() {
        video.removeEventListener('playing', onPlaying);

        resolve(video);
      }

      video.srcObject = source;

      video.addEventListener('playing', onPlaying);
    });
  });
}(window.registerModule));
