/* jshint browser: true */

window.addEventListener('load', function () {
  var header = document.querySelector('header');
  var prompt = document.querySelector('#prompt');
  var video = document.querySelector('#video');
  var canvas = document.querySelector('canvas');
  var color = document.querySelector('#color');

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

    var patchSize = 11;

    // set the actual width and height of the canvas,
    // because apparently it's not inherited from the DOM
    canvas.width = cw;
    canvas.height = ch;

    var vidX = (vw - cw) / 2;
    var vidY = (vh - ch) / 2;

    var context = canvas.getContext('2d');

    function drawContext() {
      context.drawImage(video, vidX, vidY, cw, ch, 0, 0, cw, ch);
    }

    function captureColor() {
      // get a 3x3 area of pixels from the center
      var offset = Math.floor(patchSize / 2);
      var x = Math.floor(cw / 2) - offset;
      var y = Math.floor(ch / 2) - offset;

      var pixels = [].slice.call(context.getImageData(x, y, patchSize, patchSize).data);

      var colors = [];

      while (pixels.length) {
        // pixels are an array of rgba values
        colors.push(pixels.splice(0, 4));
      }

      var average = colors.reduce(function (a, b) {
        return [
          a[0] + b[0],
          a[1] + b[1],
          a[2] + b[2],
          a[3] + b[3]
        ];
      }).map(function (c) {
        return Math.floor(c / colors.length);
      });

      color.style.backgroundColor = 'rgb(' + average[0] + ',' + average[1] + ',' + average[2] + ')';

      // draw rectangle around the selected area
      context.beginPath();
      context.lineWidth = '1';
      context.strokeStyle = '#e5e5e5';
      context.rect(x - 1, y - 1, patchSize + 2, patchSize + 2);
      context.stroke();
    }

    (function paintFrame () {
      drawContext();
      captureColor();

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
