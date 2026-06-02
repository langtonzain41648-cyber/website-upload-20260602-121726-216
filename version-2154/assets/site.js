(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
      toggle.textContent = menu.classList.contains("open") ? "×" : "☰";
    });
  }

  function bindSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function bindHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearch() {
    var root = document.getElementById("search-results");
    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-page-input");
    var heading = document.getElementById("search-title");
    if (input) {
      input.value = query;
    }
    if (heading) {
      heading.textContent = query ? "“" + query + "”相关影片" : "影片搜索";
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var data = window.MOVIE_SEARCH_DATA;
    var results = words.length
      ? data.filter(function (movie) {
          var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags].join(" ").toLowerCase();
          return words.every(function (word) {
            return text.indexOf(word) !== -1;
          });
        })
      : data.slice(0, 36);
    results = results.slice(0, 180);
    if (!results.length) {
      root.innerHTML = '<div class="search-panel"><p>暂未找到相关影片，可以换一个关键词继续搜索。</p></div>';
      return;
    }
    root.innerHTML = '<div class="movie-grid">' + results.map(function (movie) {
      var tags = String(movie.tags || "").split(/[，,、/|\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<span class="poster-wrap">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '">' +
          '<b class="year-badge">' + escapeHtml(movie.year) + '</b>' +
          '<b class="play-mark">▶</b>' +
        '</span>' +
        '<span class="card-body">' +
          '<span class="meta-row"><b>' + escapeHtml(movie.region) + '</b><b>' + escapeHtml(movie.type) + '</b></span>' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<em>' + escapeHtml(movie.oneLine) + '</em>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
    }).join("") + '</div>';
  }

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHeroSlider();
    renderSearch();
  });
})();
