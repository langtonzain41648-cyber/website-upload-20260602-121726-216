(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindPlayer(frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector("[data-play-button]");
    var overlay = frame.querySelector(".player-overlay");
    var source = frame.getAttribute("data-src");
    var hlsInstance = null;
    var loaded = false;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    }

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }
      hideOverlay();
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        loadAndPlay();
      });
    }

    frame.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }
      loadAndPlay();
    });

    if (video) {
      video.addEventListener("play", hideOverlay);
      video.addEventListener("loadeddata", hideOverlay);
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(bindPlayer);
  });
})();
