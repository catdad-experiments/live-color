/* jshint browser: true */

window.addEventListener('load', function () {
  var header = document.querySelector('header');
  var prompt = document.querySelector('#prompt');
  var video = document.querySelector('#video');
  var canvas = document.querySelector('canvas');

  function showPrompt(message, type) {
    if (typeof message === 'string') {
      message = [message];
    }

    message.forEach(function (text) {
      var paragraph = document.createElement('p');
      paragraph.appendChild(document.createTextNode(text.toString()));

      prompt.appendChild(paragraph);
    });

    prompt.classList.remove('hide');

    if (type === 'error') {
      header.classList.add('error');
    }
  }

  function onMissingFeatures(missing) {
    showPrompt([
      'It seems your browser is not supported. The following features are missing:',
      missing
    ], 'error');
  }

  function onError(err) {
    showPrompt([
      'An error occured:',
      err.message || err
    ], 'error');
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

  function continuousPaint (video, canvas) {
    var vw = video.videoWidth;
    var vh = video.videoHeight;
    var cw = canvas.clientWidth;
    var ch = canvas.clientHeight;

    // set the actual width and height of the canvas,
    // because apparently it's not inherited from the DOM
    canvas.width = cw;
    canvas.height = ch;

    var vidX = (vw - cw) / 2;
    var vidY = (vh - ch) / 2;

    var context = canvas.getContext('2d');

    (function paintFrame () {
      context.drawImage(video, vidX, vidY, cw, ch, 0, 0, cw, ch);

      // keep painting recursively on each frame
      requestAnimationFrame(paintFrame);
    }());
  }

  function handleStream (source) {
    video.srcObject = source;

    video.addEventListener('playing', function () {
      continuousPaint(video, canvas);
    });
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
