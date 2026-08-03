// controllers/testimonialController.js

// --- GET ALL TESTIMONIALS (publico) ---
async function getTestimonials() {
    return new Promise(function (resolve) {
        $.ajax({
            url: getTestimonialsRoute,
            type: "GET",
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || []);
                } else {
                    resolve([]);
                }
            },
            error: function () {
                resolve([]);
            }
        });
    });
}

// --- GET TESTIMONIAL BY PROJECT (publico) ---
async function getProjectTestimonial(projectId) {
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getProjectTestimonialRoute, { id: projectId }),
            type: "GET",
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || null);
                } else {
                    resolve(null);
                }
            },
            error: function () {
                resolve(null);
            }
        });
    });
}

// --- CREATE TESTIMONIAL (cliente asignado) ---
async function createTestimonial(data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: createTestimonialRoute,
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al publicar el testimonio";
                try {
                    var body = JSON.parse(xhr.responseText);
                    if (body.message) msg = body.message;
                } catch (e) {}
                showError(msg);
                resolve({ success: false, message: msg });
            }
        });
    });
}

// --- HELPERS COMPARTIDOS ---

// Renderiza estrellas de solo lectura (rating 0-5, pasos 0.5)
function renderStars(el, rating) {
    if (!el) return;
    var value = parseFloat(rating) || 0;
    var full = Math.floor(value);
    var half = (value - full) >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html = '';
    for (var i = 0; i < full; i++) html += '<i class="ph-fill ph-star"></i>';
    if (half) html += '<i class="ph-fill ph-star-half"></i>';
    for (var i = 0; i < empty; i++) html += '<i class="ph-light ph-star"></i>';
    el.innerHTML = html;
}

// Renderiza selector interactivo de estrellas (medias estrellas)
// Uso: renderStarSelector(el, function(rating){ ... })
function renderStarSelector(el, onChange) {
    if (!el) return;
    var rating = 0;
    var isHover = false;
    var hoverValue = 0;

    function label(value) {
        if (value <= 0) return 'Sin valorar';
        return (value % 1 === 0) ? value.toString() : value.toFixed(1);
    }

    function draw(value, asHover) {
        if (value === undefined || value === null) value = rating;
        el.innerHTML = '';
        for (var s = 1; s <= 5; s++) {
            var state;
            if (value >= s) state = 'full';
            else if (value >= s - 0.5) state = 'half';
            else state = 'empty';

            var icon;
            if (state === 'full') icon = 'ph-fill ph-star';
            else if (state === 'half') icon = 'ph-fill ph-star-half';
            else icon = 'ph-light ph-star';

            var star = document.createElement('span');
            star.className = 'star-selector-star';
            star.setAttribute('data-slot', s);
            star.innerHTML = '<i class="' + icon + ' active"></i>';
            star.title = label(state === 'half' ? s - 0.5 : s);

            star.addEventListener('mousemove', (function(slot, that) {
                return function(e) {
                    var rect = that.getBoundingClientRect();
                    var halfVal = slot - (e.clientX < rect.left + rect.width / 2 ? 0.5 : 0);
                    isHover = true;
                    hoverValue = halfVal;
                    draw(halfVal, true);
                };
            })(s, star));

            star.addEventListener('mouseleave', function() {
                isHover = false;
                draw(rating);
            });

            star.addEventListener('click', (function(slot, that) {
                return function(e) {
                    var rect = that.getBoundingClientRect();
                    rating = slot - (e.clientX < rect.left + rect.width / 2 ? 0.5 : 0);
                    isHover = false;
                    draw(rating);
                    if (typeof onChange === 'function') onChange(rating);
                };
            })(s, star));

            el.appendChild(star);
        }

        var lbl = document.createElement('span');
        lbl.className = 'star-selector-label';
        lbl.textContent = (asHover ? label(hoverValue) : label(rating));
        el.appendChild(lbl);
    }

    draw(rating);

    el.getRating = function() { return rating; };
    el.setRating = function(value) {
        rating = Math.min(5, Math.max(0, value));
        isHover = false;
        draw(rating);
    };
}

// Genera skeleton de tarjetas de testimonio mientras carga
function testimonialSkeleton(count) {
    count = count || 3;
    var html = '';
    for (var i = 0; i < count; i++) {
        html += '<div class="testimonial-card" style="min-width:100%;">' +
            '<div class="skeleton" style="height:18px;width:110px;margin-bottom:1.25rem;"></div>' +
            '<div class="skeleton skeleton-line" style="height:14px;"></div>' +
            '<div class="skeleton skeleton-line" style="height:14px;width:80%;"></div>' +
            '<div class="skeleton" style="height:14px;width:60%;margin-bottom:2rem;"></div>' +
            '<div style="display:flex;align-items:center;gap:0.875rem;">' +
                '<div class="skeleton" style="width:2.75rem;height:2.75rem;border-radius:50%;"></div>' +
                '<div style="flex:1;">' +
                    '<div class="skeleton skeleton-line" style="height:12px;width:45%;"></div>' +
                    '<div class="skeleton skeleton-line" style="height:10px;width:30%;"></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    return html;
}
