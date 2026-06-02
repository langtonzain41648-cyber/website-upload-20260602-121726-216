(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var mobileLinks = document.querySelector("[data-mobile-links]");
  if (navButton && mobileLinks) {
    navButton.addEventListener("click", function () {
      mobileLinks.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1 && dots.length === slides.length) {
    var current = 0;
    var showSlide = function (index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5600);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute("data-target"));
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var input = panel.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
    var empty = document.querySelector(panel.getAttribute("data-empty"));
    var activeFilter = "all";

    var normalize = function (value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    };

    var apply = function () {
      var keyword = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
        var show = matchesKeyword && matchesFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });

    apply();
  });
})();
