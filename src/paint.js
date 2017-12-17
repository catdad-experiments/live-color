/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'paint';
  var EVENTS;

  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');
  var painting = false;
  var lastFrame, canvasWidth, canvasHeight;

  // define patch size and location
  var patchSize = 11;
  var patchX, patchY;

  function drawImageData(data) {
    context.putImageData(data, 0, 0);
  }

  function getPatch() {
    var offset = Math.floor(patchSize / 2);
    var x = patchX - offset;
    var y = patchY - offset;

    if (x < 1) {
      x = 1;
    }

    if (y < 1) {
      y = 1;
    }

    if (x + patchSize > canvasWidth - 1) {
      x = canvasWidth - 1 - patchSize;
    }

    if (y + patchSize > canvasHeight - 1) {
      y = canvasHeight - 1 - patchSize;
    }

    return { x: x, y: y };
  }

  function captureColor() {
    var patch = getPatch();

    var pixels = [].slice.call(context.getImageData(patch.x, patch.y, patchSize, patchSize).data);
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

    // draw rectangle around the selected area
    context.beginPath();
    context.lineWidth = '1';
    context.strokeStyle = '#e5e5e5';
    context.rect(patch.x - 1, patch.y - 1, patchSize + 2, patchSize + 2);
    context.stroke();

    return {
      r: average[0],
      g: average[1],
      b: average[2]
    };
  }

  function drawColor() {
    var color = captureColor();
    EVENTS.emit('color-change', { color: color });
  }

  function onCanvasClick(ev) {
    // update the patch center, if the events support it
    patchX = ev.offsetX || ev.layerX || patchX;
    patchY = ev.offsetY || ev.layerY || patchY;

    if (!painting && lastFrame) {
      drawImageData(lastFrame);
      drawColor();
    }
  }

  function init() {
    canvas.classList.remove('hide');

    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;

    // set the actual width and height of the canvas,
    // because apparently it's not inherited from the DOM
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    patchX = Math.floor(canvasWidth / 2);
    patchY = Math.floor(canvasHeight / 2);

    canvas.addEventListener('click', onCanvasClick);
  }

  function destroy() {
    canvas.classList.add('hide');
    canvas.removeEventListener('click', onCanvasClick);

    lastFrame = null;
    painting = false;
  }

  function paintVideo(video) {
    return new Promise(function (resolve, reject) {
      painting = true;

      var vw = video.videoWidth;
      var vh = video.videoHeight;

      var vidX = (vw - canvasWidth) / 2;
      var vidY = (vh - canvasHeight) / 2;

      function drawContext() {
        context.drawImage(video, vidX, vidY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
      }

      function onStopVideo() {
        // draw one last frame and capture it
        drawContext();
        lastFrame = context.getImageData(0, 0, canvasWidth, canvasHeight);

        EVENTS.off('stop-video', onStopVideo);
        painting = false;
      }

      EVENTS.on('stop-video', onStopVideo);

      (function paintFrame () {
        if (!painting) {
          return;
        }

        drawContext();
        drawColor();

        // keep painting recursively on each frame
        requestAnimationFrame(paintFrame);
      }());

      return resolve();
    });
  }

  register(NAME, function () {
    var context = this;
    EVENTS = context.events;

    init();

    context.events.on('video-playing', function (video) {
      paintVideo(video);
    });

    return destroy;
  });
}(window.registerModule));
