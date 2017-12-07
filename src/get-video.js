/* jshint browser: true */

(function (register) {
  var NAME = 'get-video';

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

  register(NAME, function () {
    var context = this;

    context.events.on('start-video', function () {
      getVideo()
      .then(function (source) {
        context.events.emit('video-ready', source);
      })
      .catch(function (err) {
        context.events.emit('error', err);
      });
    });

    return function destroy() {};
  });
}(window.registerModule));
