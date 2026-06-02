(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const nav = document.getElementById("main-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        let index = 0;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
        const input = panel.querySelector("[data-filter-input]");
        const clear = panel.querySelector("[data-filter-clear]");
        const buttons = Array.from(panel.querySelectorAll("[data-filter-token]"));
        const section = panel.nextElementSibling;
        const cards = section ? Array.from(section.querySelectorAll(".movie-card")) : [];
        const emptyTip = section ? section.querySelector("[data-empty-tip]") : null;
        let token = "";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            const query = normalize(input ? input.value : "");
            let visibleCount = 0;
            cards.forEach(function (card) {
                const text = cardText(card);
                const matchQuery = !query || text.indexOf(query) !== -1;
                const matchToken = !token || text.indexOf(token.toLowerCase()) !== -1;
                const visible = matchQuery && matchToken;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (emptyTip) {
                emptyTip.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                token = "";
                buttons.forEach(function (button) {
                    button.classList.toggle("active", button.dataset.filterToken === "");
                });
                applyFilter();
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                token = button.dataset.filterToken || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilter();
            });
        });
    });

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const searchTitle = document.getElementById("search-title");

    if (searchInput && searchResults && window.MOVIE_SEARCH_DATA) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function renderCard(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="play-dot">▶</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="meta-row">',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '        </div>',
                '        <h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-line">' + escapeHtml(movie.genre) + '</div>',
                '    </div>',
                '</article>'
            ].join("
");
        }

        function runSearch() {
            const query = searchInput.value.trim().toLowerCase();
            const results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                return !query || movie.searchText.indexOf(query) !== -1;
            }).slice(0, 80);
            searchTitle.textContent = query ? "搜索结果：" + searchInput.value.trim() : "推荐浏览";
            searchResults.innerHTML = results.map(renderCard).join("
");
        }

        searchInput.addEventListener("input", runSearch);
        runSearch();
    }
}());
