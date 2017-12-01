/* jshint browser: true */

window.addEventListener('load', function () {
  var unsupportedPrompt = document.querySelector('#unsupported-prompt');
  var errorPrompt = document.querySelector('#error-prompt');
  var video = document.querySelector('#video');

  function hidePromps() {
    [unsupportedPrompt, errorPrompt].forEach(function (prompt) {
      prompt.classList.add('hide');
    });
  }

  function onMissingFeatures(missing) {
    hidePromps();

    unsupportedPrompt.classList.remove('hide');

    var p = document.createElement('p');
    p.appendChild(
      document.createTextNode(missing.toString())
    );

    unsupportedPrompt.appendChild(p);
  }

  function onError(err) {
    hidePromps();

    errorPrompt.classList.remove('hide');

    var p = document.createElement('p');
    p.appendChild(
      document.createTextNode(err.message || err.toString())
    );

    errorPrompt.appendChild(p);
  }

  // detect missing features in the browser
  var missingFeatures = [
    'navigator.mediaDevices'
  ].filter(function (name) {
    return !name.split('.').reduce(function (obj, path) {
      return (obj || {})[path];
    }, window);
  });

  if (missingFeatures.length) {
    return onMissingFeatures(missingFeatures.join(', '));
  }

  function handleStream (source) {
    video.srcObject = source;
  }

  function handleDevices(devices) {
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

  navigator.mediaDevices.enumerateDevices()
  .then(handleDevices)
  .then(handleStream)
  .catch(onError);
});
