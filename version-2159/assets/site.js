(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.getElementById("mainNav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-slide-dot") || 0);
                show(next);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            var result = document.querySelector("[data-result-count]");

            if (!input && !yearSelect) {
                return;
            }

            if (input && input.hasAttribute("data-read-query")) {
                var key = input.getAttribute("data-read-query");
                var params = new URLSearchParams(window.location.search);
                var value = params.get(key);
                if (value) {
                    input.value = value;
                }
            }

            if (yearSelect && yearSelect.options.length <= 1) {
                var years = [];
                cards.forEach(function (card) {
                    var year = card.getAttribute("data-year");
                    if (year && years.indexOf(year) === -1) {
                        years.push(year);
                    }
                });
                years.sort().reverse().slice(0, 40).forEach(function (year) {
                    var option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
            }

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var year = card.getAttribute("data-year") || "";
                    var matchesText = !query || text.indexOf(query) !== -1;
                    var matchesYear = !yearValue || year === yearValue;
                    var show = matchesText && matchesYear;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = "当前显示 " + visible + " 部影片";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play-cover]");
            var source = player.getAttribute("data-video-url");
            var connected = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function connect() {
                if (connected) {
                    return;
                }
                connected = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                connect();
                if (cover) {
                    cover.hidden = true;
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!connected) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (!connected) {
                    connect();
                }
                if (cover) {
                    cover.hidden = true;
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initCarousel();
        initFilters();
        initPlayers();
    });
})();
