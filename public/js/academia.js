// public/js/academia.js — Renderizado de sección Academia

var academiaUI = (function () {
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  var categoryMeta = {
    video: { icon: 'ph-video', title: 'Videos tutoriales' },
    guia: { icon: 'ph-book-bookmark', title: 'Guias escritas' },
    curso: { icon: 'ph-chalkboard-teacher', title: 'Cursos completos' },
    plantilla: { icon: 'ph-package', title: 'Plantillas / Proyectos base' }
  };

  var levelLabels = {
    basico: 'Basico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
    'todos los niveles': 'Todos los niveles'
  };

  var levelBadgeClass = {
    basico: 'basic',
    intermedio: 'intermediate',
    avanzado: 'advanced',
    'todos los niveles': 'all'
  };

  var durationIcon = {
    'PDF': 'ph-file-text',
    'Descarga': 'ph-download'
  };

  function render(data, owned) {
    var grid = document.getElementById('academiaGrid');
    if (!grid || !data || !data.length) return;

    owned = owned || {};

    var grouped = {};
    data.forEach(function (item) {
      var cat = item.category || item.Category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    var html = '';
    Object.keys(categoryMeta).forEach(function (catKey) {
      var items = grouped[catKey];
      if (!items || !items.length) return;

      var meta = categoryMeta[catKey];
      html += '<div class="academia-category" data-category="' + catKey + '">';
      html += '<button class="academia-category-header">';
      html += '<div class="academia-category-left">';
      html += '<i class="ph-light ' + meta.icon + '"></i>';
      html += '<div>';
      html += '<h3 class="academia-category-title">' + meta.title + '</h3>';
      html += '<span class="academia-category-count">' + items.length + ' recursos</span>';
      html += '</div>';
      html += '</div>';
      html += '<i class="ph-light ph-caret-down academia-category-icon"></i>';
      html += '</button>';
      html += '<div class="academia-category-body">';
      html += '<div class="academia-items">';

      items.forEach(function (item) {
        var itemId = item.id || item.Id_AcademyResource;
        var title = item.title || item.Title;
        var desc = item.description || item.Resource_Description;
        var price = item.price || item.Price || 0;
        var duration = item.duration || item.Duration;
        var level = item.level || item.Resource_Level;
        var available = item.isAvailable !== undefined ? item.isAvailable : (item.IsAvailable !== undefined ? item.IsAvailable : true);
        var content = item.content || [];
        var lessons = item.lessons || [];
        var avgRating = parseFloat(item.avgRating || item.avg_rating || 0) || 0;
        var reviewCount = parseInt(item.reviewCount || item.review_count || 0, 10) || 0;

        var availableClass = available ? '' : ' academia-item--unavailable';
        var badgeClass = 'academia-badge--' + (levelBadgeClass[level.toLowerCase()] || 'all');
        var dIcon = durationIcon[duration] || 'ph-clock';

        // Find thumbnail from content
        var thumbnail = null;
        for (var ci = 0; ci < content.length; ci++) {
          if (content[ci].fileType === 'image/thumbnail' || (content[ci].fileName && content[ci].fileName.indexOf('_thumbnail_') !== -1)) {
            thumbnail = content[ci].fileUrl || content[ci].FileUrl;
            break;
          }
        }

        var detailUrl = 'resource.html?id=' + itemId;

        html += '<div class="academia-item' + availableClass + '">';

        html += '<a href="' + detailUrl + '" class="academia-item-image">';
        if (thumbnail) {
          html += '<img src="' + thumbnail + '" alt="' + escapeHtml(title) + '" loading="lazy">';
        } else {
          html += '<picture>' +
            '<source media="(max-width: 768px)" srcset="public/media/images/Empty512x128.png">' +
            '<img src="public/media/images/Empty256x256.png" alt="' + escapeHtml(title) + '" loading="lazy">' +
            '</picture>';
        }
        html += '</a>';

        html += '<div class="academia-item-info">';
        html += '<a href="' + detailUrl + '" class="academia-item-title"><h4>' + title + '</h4></a>';
        html += '<p class="academia-item-desc">' + desc + '</p>';

        if (reviewCount > 0) {
          html += '<div class="academia-item-rating">';
          html += '<span class="stars-display" data-stars-avg="' + avgRating + '"></span>';
          html += '<span class="stars-display-value">' + reviewCount + (reviewCount === 1 ? ' valoracion' : ' valoraciones') + '</span>';
          html += '</div>';
        }

        if (lessons.length > 0) {
          html += '<div class="academia-item-lessons">';
          html += '<span class="academia-lessons-count"><i class="ph-light ph-list"></i> ' + lessons.length + ' lecciones</span>';
          html += '</div>';
        }

        html += '<div class="academia-item-meta">';
        html += '<span class="academia-badge ' + badgeClass + '">' + (levelLabels[level] || level) + '</span>';
        html += '<span class="academia-duration"><i class="ph-light ' + dIcon + '"></i> ' + duration + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="academia-item-right">';
        html += '<span class="academia-price">' + (price > 0 ? '$' + price.toLocaleString('es-MX') : 'Gratis') + '</span>';

        if (available) {
          var isPaid = price > 0;
          var isOwned = isPaid && owned[String(itemId)];
          if (isOwned) {
            html += '<a class="btn btn-sm btn-secondary" href="' + detailUrl + '"><i class="ph-light ph-check-circle"></i> Adquirido</a>';
          } else if (isPaid) {
            html += '<a class="btn btn-sm btn-primary" href="' + detailUrl + '">Obtener</a>';
          } else {
            html += '<a class="btn btn-sm btn-primary" href="' + detailUrl + '"><i class="ph-light ph-download"></i> Abrir</a>';
          }
        } else {
          html += '<button class="btn btn-sm btn-secondary" disabled>No disponible</button>';
        }

        html += '</div>';
        html += '</div>';
      });

      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    grid.innerHTML = html;
    grid.querySelectorAll('[data-stars-avg]').forEach(function (el) {
      if (typeof renderStars === 'function') {
        renderStars(el, parseFloat(el.getAttribute('data-stars-avg')) || 0);
      }
    });
  }

  return { render: render };
})();

function fetchAcademiaResources() {
  var grid = document.getElementById('academiaGrid');
  if (!grid) return;

  getAcademyResources().then(function (data) {
    var g = document.getElementById('academiaGrid');
    if (!g) return;
    if (data && data.length) {
      var user = getLocalStorage('DyT_EG_user');
      if (user && user.token) {
        getMyPurchases().then(function (ids) {
          var owned = {};
          (ids || []).forEach(function (id) { owned[String(id)] = true; });
          academiaUI.render(data, owned);
        });
      } else {
        academiaUI.render(data, {});
      }
    } else {
      g.innerHTML = '<div style="text-align:center;padding:3rem 0;color:var(--text-muted);"><p>No hay recursos disponibles aun.</p></div>';
    }
  }).catch(function () {
    var g = document.getElementById('academiaGrid');
    if (g) g.innerHTML = '<div style="text-align:center;padding:3rem 0;color:var(--text-muted);"><p>Error al cargar recursos.</p></div>';
  });
}

document.addEventListener('auralis:section-loaded', function (e) {
  if (e.detail.view === 'sections/academia') {
    fetchAcademiaResources();
  }
});

document.addEventListener('click', function (e) {
  var header = e.target.closest('.academia-category-header');
  if (!header) return;
  var category = header.closest('.academia-category');
  if (category) category.classList.toggle('open');
});
