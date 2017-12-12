/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'get-video';

  var video = document.querySelector('#video');

  function pickDevice(devices) {
    var sourceId = null;

    // enumerate all devices all array-like
    [].forEach.call(devices, function (device) {
      // we don't care about non-video
      if (device.kind !== 'videoinput') {
        return;
      }

      // use the first one by default
      if (!sourceId) {
        sourceId = device.deviceId;
      }

      // if this is a back camera, use it instead
      // TODO is this actually right? The internet example said yes,
      // but my phone says no.
      if (/back/i.test(device.label || '')) {
        sourceId = device.deviceId;
      }
    });

    // we didn't find any video input
    if (!sourceId) {
      throw new Error('no video input');
    }

    return navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          sourceId: sourceId
        }
      }
    });
  }

  function getVideo() {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(pickDevice);
  }

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

  register(NAME, function () {
    var context = this;

    context.events.on('start-video', function () {
      getVideo()
      .then(function (source) {
        return playVideo(source);
      })
      .then(function (video) {
        context.events.emit('video-playing', video);
      })
      .catch(function (err) {
        context.events.emit('error', err);
      });
    });

    return function destroy() {};
  });
}(window.registerModule));
