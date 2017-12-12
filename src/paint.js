/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'paint';

  var canvas = document.querySelector('canvas');

  function init() {
    canvas.classList.remove('hide');
  }

  function destroy() {
    canvas.classList.add('hide');
  }

  function paintVideo(video, events) {
    var painting = true;

    return new Promise(function (resolve, reject) {

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

        // draw rectangle around the selected area
        context.beginPath();
        context.lineWidth = '1';
        context.strokeStyle = '#e5e5e5';
        context.rect(x - 1, y - 1, patchSize + 2, patchSize + 2);
        context.stroke();

        return {
          r: average[0],
          g: average[1],
          b: average[2]
        };
      }

      (function paintFrame () {
        drawContext();
        var color = captureColor();

        events.emit('color-change', { color: color });

        // keep painting recursively on each frame
        requestAnimationFrame(paintFrame);
      }());

      return resolve();
    });
  }

  register(NAME, function () {
    var context = this;

    context.events.on('video-playing', function (video) {
      init();
      paintVideo(video, context.events);
    });

    return destroy;
  });
}(window.registerModule));
