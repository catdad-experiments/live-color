/* jshint browser: true */

(function (register) {
  var NAME = 'event-emitter';

  register(NAME, function () {
    var events = {};
    var api = {};

    api.on = function on(name, func) {
      var evName = name.toLowerCase();
      events[evName] = events[evName] || [];
      events[evName].push(func);

      return api;
    };

    api.off = function off(name, func) {
      var evName = name.toLowerCase();

      if (!events[evName]) {
        return api;
      }

      events[evName].splice(events[evName].indexOf(func), 1);

      return api;
    };

    api.emit = function emit(name) {
      var evName = name.toLowerCase();
      var args = arguments;

      if (!events[evName]) {
        return api;
      }

      events[evName].forEach(function(func){
        func.apply(null, [].slice.call(args, 1));
      });
    };

    return api;
  });
}(window.registerModule));
