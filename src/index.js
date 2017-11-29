/* jshint browser: true */

window.addEventListener('load', function () {
  var video = document.querySelector('#video');

  function handleStream (source) {
    video.srcObject = source;
  }

  navigator.mediaDevices.enumerateDevices()
  .then(function (devices) {
    var sourceId = null;

    console.log(devices);

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

    navigator.mediaDevices.getUserMedia({
      video: {
        sourceId: sourceId
      }
    })
    .then(handleStream)
    .catch(function (err) {
      console.error(err);
    });
  });
});
