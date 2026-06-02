(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('active', tabIndex === current);
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-card-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', function () {
      var keyword = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.style.display = haystack.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }
})();
