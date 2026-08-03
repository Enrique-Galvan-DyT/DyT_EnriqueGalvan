// public/js/experience.js
// Calcula los anios de experiencia segun el anio actual (2026 = 5+) y actualiza
// todo elemento con [data-exp]. Sin persistencia.
(function() {
  var START_YEAR = 2021;

  function years() {
    var y = new Date().getFullYear() - START_YEAR;
    return y < 0 ? 0 : y;
  }

  function apply() {
    var els = document.querySelectorAll('[data-exp]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = els[i].textContent.replace(/^\d+/, years());
    }
  }

  document.addEventListener('auralis:section-loaded', apply);
  document.addEventListener('auralis:ready', apply);
})();
