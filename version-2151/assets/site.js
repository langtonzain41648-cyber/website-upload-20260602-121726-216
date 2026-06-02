(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var count = document.querySelector('[data-filter-count]');

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalized(input && input.value);
            var selectedYear = normalized(year && year.value);
            var selectedRegion = normalized(region && region.value);
            var selectedType = normalized(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalized(card.getAttribute('data-search'));
                var cardYear = normalized(card.getAttribute('data-year'));
                var cardRegion = normalized(card.getAttribute('data-region'));
                var cardType = normalized(card.getAttribute('data-type'));
                var matched = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [input, year, region, type].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener('input', applyFilter);
            element.addEventListener('change', applyFilter);
        });
        applyFilter();
    }

    function setupPlayer() {
        var video = document.querySelector('[data-hls-player]');
        if (!video) {
            return;
        }
        var shell = document.querySelector('[data-player-shell]');
        var playButton = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-player-status]');
        var source = video.getAttribute('data-src');
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function attachSource() {
            if (!source) {
                setStatus('未找到播放源。');
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络错误，正在重新加载播放源。');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体错误，正在尝试恢复。');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('无法播放视频，请刷新页面后重试。');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                setStatus('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Safari、Firefox 或 Edge。');
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setStatus('浏览器阻止了自动播放，请点击播放器控制栏开始播放。');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
        attachSource();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
