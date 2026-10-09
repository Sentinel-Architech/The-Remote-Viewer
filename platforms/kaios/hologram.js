(function () {
  var canvas = document.getElementById("hologram");
  var ctx = canvas.getContext("2d");
  var hue = Math.PI;
  var tier = 0;
  var frame = 0;

  function palette(t) {
    var d0 = hue / 6.28318;
    var d1 = 0.33 + d0;
    var d2 = 0.67 + d0;
    function channel(d) {
      return 0.5 + 0.5 * Math.cos(6.28318 * (t + d));
    }
    return [channel(d0), channel(d1), channel(d2)];
  }

  function draw() {
    var w = window.innerWidth || 240;
    var h = window.innerHeight || 320;
    canvas.width = w;
    canvas.height = h;
    var image = ctx.createImageData(w, h);
    var data = image.data;
    var step = (tier & 1) === 0 ? 4 : 0;
    for (var y = 0; y < h; y++) {
      var scan = (tier & 2) !== 0 ? Math.sin(y / h * 350 + frame) * 0.06 : 0;
      for (var x = 0; x < w; x++) {
        var t = x / w;
        if (step) t = Math.floor(t * 4) / 4;
        var color = palette(t);
        if ((tier & 4) !== 0) {
          var dx = x / w - 0.5;
          var dy = y / h - 0.5;
          var rim = 1 - Math.sqrt(dx * dx + dy * dy);
          var fresnel = Math.pow(Math.max(rim, 0), 2.5) * 0.3;
          color[0] += fresnel;
          color[1] += fresnel;
          color[2] += fresnel;
        }
        var i = (y * w + x) * 4;
        data[i] = Math.max(0, Math.min(255, (color[0] - scan) * 255));
        data[i + 1] = Math.max(0, Math.min(255, (color[1] - scan) * 255));
        data[i + 2] = Math.max(0, Math.min(255, (color[2] - scan) * 255));
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    frame += 0.05;
    window.requestAnimationFrame(draw);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") hue += 0.15;
    if (event.key === "ArrowLeft") hue -= 0.15;
  });
  draw();
})();
