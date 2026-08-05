// controllers/resourceController.js — Lógica de la vista resource.html (detalle de recurso)

(function () {
    if (document.body.getAttribute('data-page') !== 'resource') return;

    var resourceId = null;

    function getParam(name) {
        var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        if (m) return decodeURIComponent(m[1]);
        var h = window.location.hash.replace('#/', '').replace('#', '');
        return h.split('/')[0] || '';
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function isLoggedIn() {
        var user = getLocalStorage('DyT_EG_user');
        return !!(user && user.token);
    }

    // Rewrite de links del navbar/footer para que apunten al SPA index.html
    function rewriteSiteLinks(root) {
        if (!root) return;
        root.querySelectorAll('a[href^="#"]').forEach(function (a) {
            var h = a.getAttribute('href');
            a.setAttribute('href', (h === '#') ? 'index.html' : 'index.html' + h);
        });
    }

    function formatReviewDate(iso) {
        try {
            return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) { return ''; }
    }

    // ── Modal de confirmacion / aviso ─────────────
    var confirmModalEl = null;
    var confirmResolve = null;

    function openConfirmModal(title, message, onConfirm, opts) {
        document.getElementById('confirmModalTitle').textContent = title || 'Confirmar';
        document.getElementById('confirmModalMsg').textContent = message || '';
        var okBtn = document.getElementById('confirmOkBtn');
        var cancelBtn = document.getElementById('confirmCancelBtn');
        okBtn.textContent = (opts && opts.confirmText) || 'Confirmar';
        cancelBtn.style.display = (opts && opts.hideCancel) ? 'none' : '';
        confirmResolve = (typeof onConfirm === 'function') ? onConfirm : null;
        confirmModalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeConfirmModal() {
        confirmModalEl.classList.remove('active');
        document.body.style.overflow = '';
        confirmResolve = null;
    }

    function showAlertModal(message, title) {
        openConfirmModal(title || 'Aviso', message, null, { hideCancel: true, confirmText: 'Aceptar' });
    }

    // ── Valoraciones ──────────────────────────────
    function loadReviews(id) {
        var section = document.getElementById('reviewsSection');
        if (!section) return;
        var summaryEl = document.getElementById('reviewsSummary');
        var formEl = document.getElementById('reviewsForm');
        var listEl = document.getElementById('reviewsList');

        var user = getLocalStorage('DyT_EG_user');
        var token = user ? user.token : null;
        var isAdmin = !!(user && user.role === 'admin');

        getAcademyResourceReviews(id).then(function (json) {
            if (!json || json.success !== true) return;
            var data = json.data || {};
            var reviews = data.reviews || [];
            var avg = parseFloat(data.avgRating || 0);
            var count = parseInt(data.count, 10) || reviews.length || 0;
            var my = data.myReview || null;

            // Resumen con promedio
            var summaryHtml = '<div class="resource-review-average">';
            if (count > 0) {
                summaryHtml += '<span class="resource-review-avg-num">' + (Math.round(avg * 10) / 10).toFixed(1) + '</span>';
                summaryHtml += '<div class="resource-review-summary-right">' +
                    '<div class="stars-display" id="reviewsAvgStars"></div>' +
                    '<span class="stars-display-value">' + count + (count === 1 ? ' valoracion' : ' valoraciones') + '</span>' +
                    '</div>';
            } else {
                summaryHtml += '<span class="resource-review-empty">Aun no hay valoraciones. Se el primero en dejar una.</span>';
            }
            summaryHtml += '</div>';
            summaryEl.innerHTML = summaryHtml;
            if (count > 0) renderStars(document.getElementById('reviewsAvgStars'), avg);

            // Formulario solo para compradores activos o admin que aun no valoran
            formEl.style.display = 'none';
            formEl.innerHTML = '';
            if (user && token) {
                getPaymentStatus(id).then(function (st) {
                    var canReview = isAdmin || st.owned;
                    if (!canReview) return;
                    if (my) {
                        formEl.innerHTML = '<div class="resource-owned-badge"><i class="ph-light ph-check-circle"></i> Ya valoraste este recurso</div>';
                        formEl.style.display = '';
                        return;
                    }
                    renderReviewForm();
                });
            }

            // Lista de valoraciones
            if (reviews.length > 0) {
                var listHtml = '';
                reviews.forEach(function (r) {
                    listHtml += '<div class="resource-review-item">' +
                        '<div class="resource-review-head">' +
                            '<span class="resource-review-author">' + escapeHtml(r.clientName || r.User || 'Usuario') + '</span>' +
                            '<span class="resource-review-date">' + formatReviewDate(r.createdAt) + '</span>' +
                        '</div>' +
                        '<div class="stars-display" data-stars></div>' +
                        (r.comment ? '<p class="resource-review-comment">' + escapeHtml(r.comment) + '</p>' : '') +
                        (isAdmin ? '<button class="btn btn-sm btn-danger" data-del="' + r.id + '"><i class="ph-light ph-trash"></i> Eliminar</button>' : '') +
                    '</div>';
                });
                listEl.innerHTML = listHtml;
                listEl.querySelectorAll('[data-stars]').forEach(function (el, i) {
                    renderStars(el, reviews[i].rating);
                });
                listEl.querySelectorAll('[data-del]').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var reviewId = btn.getAttribute('data-del');
                        openConfirmModal('Eliminar valoracion', '¿Seguro que deseas eliminar esta valoracion?', function () {
                            deleteAcademyResourceReview(id, reviewId).then(function (res) {
                                if (res && res.success === true) {
                                    loadReviews(id);
                                } else {
                                    showAlertModal((res && res.message) || 'No se pudo eliminar la valoracion.');
                                }
                            });
                        }, { confirmText: 'Eliminar' });
                    });
                });
            } else {
                listEl.innerHTML = '';
            }

            section.style.display = '';
        }).catch(function () {
            section.style.display = 'none';
        });
    }

    function renderReviewForm() {
        var formEl = document.getElementById('reviewsForm');
        formEl.innerHTML =
            '<div class="resource-review-form-inner">' +
                '<h3 class="resource-review-form-title">Tu valoracion</h3>' +
                '<p class="resource-review-form-note">Comparte tu experiencia con este recurso. Una vez enviada no podras modificarla.</p>' +
                '<div class="star-selector" id="reviewStarSelector"></div>' +
                '<label class="form-label" for="reviewComment">Comentario (opcional)</label>' +
                '<textarea class="form-input" id="reviewComment" rows="3" maxlength="1000" placeholder="¿Que te parecio este recurso?"></textarea>' +
                '<div class="resource-review-error" id="reviewError" style="display:none;"></div>' +
                '<button class="btn btn-primary" id="reviewSubmitBtn"><i class="ph-light ph-paper-plane-tilt"></i> Enviar valoracion</button>' +
            '</div>';
        formEl.style.display = '';
        renderStarSelector(document.getElementById('reviewStarSelector'));
        document.getElementById('reviewSubmitBtn').addEventListener('click', function () {
            var selector = document.getElementById('reviewStarSelector');
            var rating = (typeof selector.getRating === 'function') ? selector.getRating() : 0;
            var err = document.getElementById('reviewError');
            if (rating <= 0) {
                err.textContent = 'Selecciona una valoracion con estrellas';
                err.style.display = 'block';
                return;
            }
            openConfirmModal('Enviar valoracion', 'Una vez enviada tu valoracion quedara registrada y no podras modificarla despues. ¿Deseas continuar?', function () {
                var comment = document.getElementById('reviewComment').value;
                submitAcademyResourceReview(resourceId, { rating: rating, comment: comment }).then(function (json) {
                    if (json && json.success === true) {
                        loadReviews(resourceId);
                    } else {
                        err.textContent = (json && json.message) || 'No se pudo guardar tu valoracion.';
                        err.style.display = 'block';
                    }
                }).catch(function () {
                    err.textContent = 'Error de conexion. Intenta de nuevo.';
                    err.style.display = 'block';
                });
            }, { confirmText: 'Enviar' });
        });
    }

    // ── Pago con Conekta ─────────────────────────────
    var conektaPublicKey = null;

    function initConekta() {
        return getPaymentConfig().then(function (data) {
            if (data && data.publicKey) {
                conektaPublicKey = data.publicKey;
                if (typeof Conekta !== 'undefined') {
                    Conekta.setPublicKey(conektaPublicKey);
                    Conekta.setLanguage('es');
                }
                return true;
            }
            return false;
        });
    }

    function renderPurchaseArea(price, isPaid, resource) {
        var area = document.getElementById('purchaseArea');
        if (!area || !isPaid) {
            if (area) area.style.display = 'none';
            return;
        }
        var rid = resource.id || resource.Id_AcademyResource;
        getPaymentStatus(rid).then(function (st) {
            if (st.owned) {
                area.innerHTML = '<div class="resource-owned-badge">' +
                    '<i class="ph-light ph-check-circle"></i> Adquirido - contenido desbloqueado' +
                '</div>';
            } else {
                area.innerHTML = '<div class="resource-purchase-card">' +
                    '<div class="resource-purchase-price">$' + price.toLocaleString('es-MX') + ' MXN</div>' +
                    '<p class="resource-purchase-note">Acceso de por vida a este recurso tras el pago.</p>' +
                    '<button class="btn btn-primary" id="buyResourceBtn">' +
                        '<i class="ph-light ph-shopping-cart"></i> Comprar ahora' +
                    '</button>' +
                '</div>';
                var btn = document.getElementById('buyResourceBtn');
                if (btn) btn.addEventListener('click', function () {
                    if (!isLoggedIn()) {
                        window.location.href = 'index.html#/login';
                        return;
                    }
                    openCheckout(resource, price);
                });
            }
            area.style.display = '';
        });
    }

    var currentCheckout = null;

    function openCheckout(resource, price) {
        currentCheckout = { resource: resource, price: price };
        document.getElementById('checkoutItemName').textContent = resource.title || resource.Title || '';
        document.getElementById('checkoutPrice').textContent = '$' + price.toLocaleString('es-MX') + ' MXN';
        document.getElementById('checkoutSubtitle').textContent = 'Pago único por tarjeta';
        var user = getLocalStorage('DyT_EG_user');
        if (user) {
            document.getElementById('checkoutName').value = user.name || '';
            document.getElementById('checkoutEmail').value = user.email || '';
        }
        hideCheckoutError();
        var payBtn = document.getElementById('payButton');
        payBtn.disabled = false;
        document.getElementById('payButtonLabel').textContent = 'Pagar';
        var modal = document.getElementById('checkoutModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { document.getElementById('checkoutName').focus(); }, 250);
    }

    function closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function showCheckoutError(msg) {
        var el = document.getElementById('checkoutError');
        el.textContent = msg;
        el.style.display = 'block';
    }

    function hideCheckoutError() {
        var el = document.getElementById('checkoutError');
        el.style.display = 'none';
    }

    function submitCard(e) {
        e.preventDefault();
        if (!conektaPublicKey || typeof Conekta === 'undefined') {
            showCheckoutError('No se pudo cargar la pasarela de pago. Intenta de nuevo.');
            return;
        }
        var payBtn = document.getElementById('payButton');
        payBtn.disabled = true;
        document.getElementById('payButtonLabel').textContent = 'Procesando...';
        hideCheckoutError();

        try {
            Conekta.Token.create(document.getElementById('cardForm'), function (token) {
                if (token && token.id) {
                    processCheckoutToken(token.id);
                } else {
                    payBtn.disabled = false;
                    document.getElementById('payButtonLabel').textContent = 'Pagar';
                    showCheckoutError('No se pudo procesar la tarjeta.');
                }
            }, function (error) {
                payBtn.disabled = false;
                document.getElementById('payButtonLabel').textContent = 'Pagar';
                var msg = (error && (error.message_to_purchaser || error.message)) || 'Datos de tarjeta inválidos.';
                showCheckoutError(msg);
            });
        } catch (err) {
            payBtn.disabled = false;
            document.getElementById('payButtonLabel').textContent = 'Pagar';
            showCheckoutError('Error inesperado al procesar la tarjeta.');
        }
    }

    function processCheckoutToken(tokenId) {
        var user = getLocalStorage('DyT_EG_user');
        if (!user || !user.token || !currentCheckout) return;
        var payBtn = document.getElementById('payButton');
        createPaymentCheckout(
            currentCheckout.resource.id || currentCheckout.resource.Id_AcademyResource,
            tokenId,
            document.getElementById('checkoutName').value,
            document.getElementById('checkoutEmail').value
        ).then(function (json) {
            if (json && json.success === true) {
                if (json.data && json.data.paid) {
                    showCheckoutSuccess();
                } else {
                    payBtn.disabled = false;
                    document.getElementById('payButtonLabel').textContent = 'Pagar';
                    showCheckoutError((json.data && json.data.status) ? 'Pago ' + json.data.status + '. Intenta de nuevo o usa otra tarjeta.' : 'Pago pendiente.');
                }
            } else if (json && json.alreadyPurchased) {
                showCheckoutSuccess('Ya habías adquirido este recurso.');
            } else if (json && json.paymentError) {
                payBtn.disabled = false;
                document.getElementById('payButtonLabel').textContent = 'Pagar';
                showCheckoutError(json.message || 'La tarjeta fue rechazada.');
            } else {
                payBtn.disabled = false;
                document.getElementById('payButtonLabel').textContent = 'Pagar';
                showCheckoutError((json && json.message) || 'No se pudo completar el pago.');
            }
        }).catch(function () {
            payBtn.disabled = false;
            document.getElementById('payButtonLabel').textContent = 'Pagar';
            showCheckoutError('Error de conexión. Intenta de nuevo.');
        });
    }

    function showCheckoutSuccess(customMsg) {
        var modalBody = document.querySelector('#checkoutModal .pricing-modal-body');
        modalBody.innerHTML =
            '<div class="checkout-success">' +
                '<i class="ph-light ph-check-circle"></i>' +
                '<h3>Pago exitoso</h3>' +
                '<p>' + escapeHtml(customMsg || 'Tu pago fue procesado y el recurso ya está disponible.') + '</p>' +
                '<button class="btn btn-primary" id="checkoutDoneBtn">Ver recurso</button>' +
            '</div>';
        var doneBtn = document.getElementById('checkoutDoneBtn');
        if (doneBtn) doneBtn.addEventListener('click', function () { window.location.reload(); });
        setTimeout(function () { window.location.reload(); }, 1800);
    }

    // ── Render de contenido ─────────────────────────
    function embedVideo(url) {
        if (!url) return '';
        var ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
            return '<iframe src="https://www.youtube.com/embed/' + ytMatch[1] + '" allowfullscreen></iframe>';
        }
        var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            return '<iframe src="https://player.vimeo.com/video/' + vimeoMatch[1] + '" allowfullscreen></iframe>';
        }
        return '<video controls controlsList="nodownload" disablePictureInPicture oncontextmenu="return false"><source src="' + url + '"></video>';
    }

    function videoHtml(src) {
        return '<video controls controlsList="nodownload" disablePictureInPicture preload="none" oncontextmenu="return false">' +
            '<source src="' + src + '"></video>';
    }

    function initPlyr(el) {
        if (!el || typeof Plyr === 'undefined') return;
        try {
            new Plyr(el, {
                preload: 'none',
                controls: ['play-large','play','progress','current-time','duration','mute','volume','captions','settings','pip','airplay','fullscreen'],
                disableContextMenu: true,
                storage: { enabled: false },
                fullscreen: { enabled: true, fallback: true }
            });
        } catch (e) {}
    }

    function lockedHtml(title, message) {
        var actions = '';
        if (!isLoggedIn()) {
            actions += '<a href="index.html#/login" class="btn btn-secondary">Iniciar sesion</a>';
        }
        actions += '<a href="index.html#/contacto" class="btn btn-primary">Contactar</a>';
        return '<div class="video-locked">' +
            '<i class="ph-light ph-lock-key"></i>' +
            '<strong>' + escapeHtml(title) + '</strong>' +
            '<p>' + escapeHtml(message) + '</p>' +
            '<div class="video-locked-actions">' + actions + '</div>' +
        '</div>';
    }

    function setVideoHTML(container, html) {
        container.innerHTML = html;
        var v = container.querySelector('video');
        if (v) initPlyr(v);
    }

    function renderProtectedVideo(container, contentId) {
        container.innerHTML = '';
        if (!contentId) {
            container.innerHTML = lockedHtml('Video protegido', 'No se pudo localizar el archivo de video.');
            return;
        }
        if (!isLoggedIn()) {
            container.innerHTML = lockedHtml('Contenido exclusivo para compradores', 'Inicia sesion o adquiere este recurso para verlo.');
            return;
        }
        var src = buildUrl(getContentFileRoute, { id: contentId });
        var user = getLocalStorage('DyT_EG_user');
        if (user && user.token) {
            src += '?auth=' + encodeURIComponent(user.token);
        }
        container.innerHTML = videoHtml(src);
        var v = container.querySelector('video');
        if (v) {
            initPlyr(v);
            v.addEventListener('error', function () {
                container.innerHTML = lockedHtml('Video protegido', 'No tienes acceso a este video.');
            });
        }
    }

    function isImageUrl(url) {
        return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
    }

    function isPdfUrl(url) {
        return /\.pdf(\?|$)/i.test(url);
    }

    function isVideoFileName(name) {
        return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(name || '');
    }

    function isVideoContent(f) {
        var ft = f.fileType || f.FileType || '';
        if (ft.indexOf('video') !== -1) return true;
        return isVideoFileName(f.fileName || f.FileName || '') || isVideoFileName(f.fileUrl || f.FileUrl || '');
    }

    // ── Bootstrap de la vista ───────────────────────
    function showResourceError(msg) {
        document.getElementById('resourceLoading').style.display = 'none';
        document.getElementById('resourceErrorMsg').textContent = msg;
        document.getElementById('resourceError').style.display = 'flex';
        document.getElementById('resourceContent').style.display = 'none';
    }

    function showContent() {
        document.getElementById('resourceLoading').style.display = 'none';
        document.getElementById('resourceError').style.display = 'none';
        document.getElementById('resourceContent').style.display = 'block';
    }

    function generateFileEmbed(f) {
        var fName = f.fileName || f.FileName || '';
        var fUrl = f.fileUrl || f.FileUrl || '';
        var fSize = f.fileSize || f.FileSize || '';
        var fType = f.fileType || f.FileType || '';
        var fDesc = f.description || f.Description || '';
        var hasDesc = fDesc.length > 0;
        var contentId = f.id || f.Id_AcademyContent;

        if (fType.indexOf('pdf') !== -1 || isPdfUrl(fName) || isPdfUrl(fUrl)) {
            var apiUrl = buildUrl(getContentFileRoute, { id: contentId });
            var pdfUser = getLocalStorage('DyT_EG_user');
            if (pdfUser && pdfUser.token) {
                apiUrl += '?auth=' + encodeURIComponent(pdfUser.token);
            }
            var html = '<div class="resource-file-viewer resource-pdf-embed">' +
                '<div class="resource-pdf-toolbar"><i class="ph-light ph-file-pdf"></i> ' + escapeHtml(fName) + '</div>';
            if (hasDesc) html += '<div class="resource-file-description">' + escapeHtml(fDesc) + '</div>';
            html += '<embed src="' + apiUrl + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" width="100%" height="700" oncontextmenu="return false">' +
                '<div class="resource-file-caption">' + escapeHtml(fName) + ' <span class="resource-file-caption-size">' + escapeHtml(fSize) + '</span></div>' +
                '</div>';
            return html;
        }

        if (fType.indexOf('image') !== -1 || isImageUrl(fUrl)) {
            var html = '<div class="resource-file-viewer">';
            if (hasDesc) html += '<div class="resource-file-description">' + escapeHtml(fDesc) + '</div>';
            html += '<img src="' + fUrl + '" alt="' + escapeHtml(fName) + '" style="width:100%;border-radius:var(--radius-md);" oncontextmenu="return false">' +
                '<div class="resource-file-caption">' + escapeHtml(fName) + ' <span class="resource-file-caption-size">' + escapeHtml(fSize) + '</span></div>' +
                '</div>';
            return html;
        }

        if (fType.indexOf('video') !== -1 || isVideoFileName(fName) || isVideoFileName(fUrl)) {
            var videoContentId = f.id || f.Id_AcademyContent;
            var html = '<div class="resource-file-viewer">';
            if (hasDesc) html += '<div class="resource-file-description">' + escapeHtml(fDesc) + '</div>';
            if (resourceIsPaid) {
                if (videoContentId) {
                    html += '<div class="resource-video-container" data-protected-content-id="' + videoContentId + '"></div>';
                } else {
                    html += '<div class="resource-video-container">' + lockedHtml('Video protegido', 'El video de este recurso solo se entrega por la API a los compradores.') + '</div>';
                }
            } else {
                html += '<div class="resource-video-container">' + embedVideo(fUrl) + '</div>';
            }
            html += '<div class="resource-file-caption">' + escapeHtml(fName) + ' <span class="resource-file-caption-size">' + escapeHtml(fSize) + '</span></div>' +
                '</div>';
            return html;
        }

        var fileIcon = 'ph-file-text';
        if (fType.indexOf('pdf') !== -1 || fName.toLowerCase().indexOf('.pdf') !== -1) fileIcon = 'ph-file-pdf';
        else if (fType.indexOf('spreadsheet') !== -1 || fName.toLowerCase().match(/\.(xls|xlsx)$/)) fileIcon = 'ph-file-spreadsheet';
        else if (fType.indexOf('word') !== -1 || fName.toLowerCase().match(/\.(doc|docx)$/)) fileIcon = 'ph-file-doc';
        else if (fType.indexOf('zip') !== -1) fileIcon = 'ph-file-zip';
        else if (fType.indexOf('image') !== -1 || isImageUrl(fName)) fileIcon = 'ph-image';

        return '<div class="resource-file-info">' +
            '<i class="ph-light ' + fileIcon + '"></i>' +
            '<span class="resource-file-info-name">' + escapeHtml(fName) + '</span>' +
            (fSize ? '<span class="resource-file-info-size">' + escapeHtml(fSize) + '</span>' : '') +
            '</div>';
    }

    var resourceIsPaid = false;

    function renderContentSections(files, lessons, category, isPaid, resource) {
        var videoSection = document.getElementById('videoSection');
        var videoContainer = document.getElementById('videoContainer');

        // --- VIDEO category ---
        if (category === 'video') {
            if (isPaid) {
                var vfile = null;
                for (var vi = 0; vi < files.length; vi++) {
                    if (isVideoContent(files[vi])) { vfile = files[vi]; break; }
                }
                videoSection.style.display = '';
                if (vfile) {
                    renderProtectedVideo(videoContainer, vfile.id || vfile.Id_AcademyContent);
                } else {
                    videoContainer.innerHTML = lockedHtml('Video protegido', 'El video de este recurso solo se entrega por la API a los compradores.');
                }
            } else {
                var videoUrl = '';
                if (lessons.length > 0 && lessons[0].videoUrl) {
                    videoUrl = lessons[0].videoUrl;
                }
                if (videoUrl) {
                    videoSection.style.display = '';
                    setVideoHTML(videoContainer, embedVideo(videoUrl));
                }
            }
        }

        // --- CURSO category ---
        if (category === 'curso' && lessons.length > 0) {
            var lessonsSection = document.getElementById('lessonsSection');
            lessonsSection.style.display = '';

            var lessonsHtml = '';
            lessons.forEach(function (l, i) {
                var lTitle = l.title || l.Title || '';
                var lDuration = l.duration || l.Duration || '';
                var lFree = l.isFree || l.IsFree || false;
                var locked = isPaid && !lFree;
                var freeBadge = lFree ? '<span class="free-badge">Gratis</span>' : '';
                var durSpan = lDuration ? '<span><i class="ph-light ph-clock"></i> ' + lDuration + '</span>' : '';
                var playIcon = locked ? '<i class="ph-light ph-lock-key"></i>' : '<i class="ph-light ph-play-circle"></i>';

                lessonsHtml += '<div class="resource-lesson-item' + (locked ? ' resource-lesson-item--locked' : '') + '" data-index="' + i + '" data-url="' + (l.videoUrl || l.VideoUrl || '') + '">' +
                    '<div class="resource-lesson-number">' + (i + 1) + '</div>' +
                    '<div class="resource-lesson-info">' +
                        '<p class="resource-lesson-title">' + escapeHtml(lTitle) + '</p>' +
                        '<div class="resource-lesson-meta">' + freeBadge + durSpan + '</div>' +
                    '</div>' +
                    '<div class="resource-lesson-play">' + playIcon + '</div>' +
                '</div>';
            });

            document.getElementById('lessonsContainer').innerHTML = lessonsHtml;

            var firstWithVideo = null;
            for (var i = 0; i < lessons.length; i++) {
                if (isPaid && !(lessons[i].isFree || lessons[i].IsFree)) continue;
                if (lessons[i].videoUrl || lessons[i].VideoUrl) {
                    firstWithVideo = i;
                    break;
                }
            }
            if (firstWithVideo !== null) {
                playLesson(firstWithVideo, lessons, isPaid);
            }

            document.querySelectorAll('.resource-lesson-item').forEach(function (el) {
                el.addEventListener('click', function () {
                    var idx = parseInt(el.getAttribute('data-index'));
                    playLesson(idx, lessons, isPaid);
                });
            });
        }

        // --- BODY CONTENT (CKEditor + placeholder injection) ---
        var bodyHtml = resource.bodyHtml || resource.BodyHtml || '';
        var bodySection = document.getElementById('bodySection');

        if (bodyHtml) {
            bodySection.style.display = '';

            files.sort(function (a, b) {
                return (a.sortOrder || a.SortOrder || 0) - (b.sortOrder || b.SortOrder || 0);
            });

            var renderedHtml = bodyHtml.replace(/\{\{file:(\d+)\}\}/g, function (match, idx) {
                var f = files[parseInt(idx)];
                if (!f) return '<span style="color:var(--accent-burgundy);">[Archivo no encontrado]</span>';
                return generateFileEmbed(f);
            });

            if (typeof DOMPurify !== 'undefined') {
                renderedHtml = DOMPurify.sanitize(renderedHtml, {
                    ALLOWED_TAGS: ['p','br','strong','em','u','s','ul','ol','li','a','blockquote','h3','h4','h5','img','table','thead','tbody','tr','td','th','hr','pre','code','span','div','embed','video','source','iframe'],
                    ALLOWED_ATTR: ['href','target','rel','src','alt','class','style','width','height','type','frameborder','allowfullscreen','controlslist','disablepictureinpicture','oncontextmenu','allow','data-protected-content-id']
                });
            }

            document.getElementById('bodyContainer').innerHTML = renderedHtml;
            initInlineMedia();
        }
        else if (files.length > 0) {
            bodySection.style.display = '';
            var fallbackHtml = '<div class="resource-files-container">';
            files.sort(function (a, b) {
                return (a.sortOrder || a.SortOrder || 0) - (b.sortOrder || b.SortOrder || 0);
            });
            files.forEach(function (f) {
                fallbackHtml += generateFileEmbed(f);
            });
            fallbackHtml += '</div>';
            document.getElementById('bodyContainer').innerHTML = fallbackHtml;
            initInlineMedia();
        }
    }

    function initInlineMedia() {
        var bc = document.getElementById('bodyContainer');
        if (!bc) return;
        bc.querySelectorAll('[data-protected-content-id]').forEach(function (el) {
            renderProtectedVideo(el, el.getAttribute('data-protected-content-id'));
        });
        bc.querySelectorAll('video').forEach(function (v) { initPlyr(v); });
    }

    function playLesson(index, lessonsList, isPaid) {
        var l = lessonsList[index];
        var locked = isPaid && !(l.isFree || l.IsFree);

        document.querySelectorAll('.resource-lesson-item').forEach(function (el, i) {
            el.classList.toggle('active', i === index);
        });

        var videoContainer = document.getElementById('videoContainer');
        var videoSection = document.getElementById('videoSection');
        videoSection.style.display = '';

        if (locked) {
            videoContainer.innerHTML = lockedHtml('Compra el curso', 'Esta leccion esta disponible para quienes adquieran este curso.');
            videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        var url = l.videoUrl || l.VideoUrl || '';
        if (!url) return;

        var m = url.match(/api\/content\/file\/(\d+)/);
        if (m) {
            renderProtectedVideo(videoContainer, m[1]);
        } else if (/^\d+$/.test(url.trim())) {
            renderProtectedVideo(videoContainer, url.trim());
        } else {
            setVideoHTML(videoContainer, embedVideo(url));
        }

        videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function initResourcePage() {
        resourceId = getParam('id');
        if (!resourceId) {
            showResourceError('ID de recurso no valido');
            return;
        }

        // Modal de confirmacion
        confirmModalEl = document.getElementById('confirmModal');
        document.getElementById('confirmOkBtn').addEventListener('click', function () {
            var cb = confirmResolve;
            closeConfirmModal();
            if (cb) cb();
        });
        document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirmModal);
        document.getElementById('confirmModalClose').addEventListener('click', closeConfirmModal);
        if (confirmModalEl) {
            confirmModalEl.addEventListener('click', function (e) {
                if (e.target === confirmModalEl) closeConfirmModal();
            });
        }

        // Checkout (Conekta)
        initConekta();
        document.getElementById('cardForm').addEventListener('submit', submitCard);
        document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
        var checkoutModalEl = document.getElementById('checkoutModal');
        if (checkoutModalEl) {
            checkoutModalEl.addEventListener('click', function (e) {
                if (e.target === checkoutModalEl) closeCheckout();
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var m = document.getElementById('checkoutModal');
                if (m && m.classList.contains('active')) closeCheckout();
            }
        });

        // Proteccion de contenido
        document.addEventListener('contextmenu', function (e) {
            if (e.target.closest('.resource-video-container') || e.target.closest('.resource-file-viewer')) {
                e.preventDefault();
                return false;
            }
        });

        getAcademyResource(resourceId).then(function (resource) {
            if (!resource) {
                showResourceError('Recurso no encontrado');
                return;
            }

            var title = resource.title || resource.Title || '';
            var desc = resource.description || resource.Resource_Description || '';
            var category = resource.category || resource.Category || '';
            var duration = resource.duration || resource.Duration || '';
            var content = resource.content || [];
            var lessons = resource.lessons || [];
            var price = parseFloat(resource.price || resource.Price || 0) || 0;
            var isPaid = price > 0;
            resourceIsPaid = isPaid;

            var catLabels = { video: 'Video', guia: 'Guia', curso: 'Curso', plantilla: 'Plantilla' };

            document.title = title + ' | Desarrollo y Tecnología - Enrique Galván';
            document.getElementById('resourceTitle').textContent = title;
            document.getElementById('resourceDesc').textContent = desc;

            renderPurchaseArea(price, isPaid, resource);

            var badge = document.getElementById('resourceBadge');
            badge.textContent = catLabels[category] || category;
            badge.className = 'academia-badge';

            document.getElementById('resourceDuration').innerHTML = '<i class="ph-light ph-clock"></i> ' + duration;

            // Filter out thumbnail from content
            var files = content.filter(function (c) {
                var ft = (c.fileType || c.FileType || '');
                var fn = (c.fileName || c.FileName || '');
                return ft !== 'image/thumbnail' && fn !== '_thumbnail_';
            });

            // Recursos pagados: el contenido solo se muestra a compradores
            getPaymentStatus(resourceId).then(function (st) {
                if (isPaid && !st.owned) {
                    lockResourceContent();
                    return;
                }
                renderContentSections(files, lessons, category, isPaid, resource);
            });

            function lockResourceContent() {
                var sections = ['videoSection', 'lessonsSection', 'bodySection'];
                sections.forEach(function (id) {
                    var el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });
                var lock = document.getElementById('contentLock');
                if (!lock) return;
                lock.style.display = '';
                var actions = document.getElementById('contentLockActions');
                if (!actions) return;
                actions.innerHTML = '';
                if (!isLoggedIn()) {
                    actions.innerHTML += '<a href="index.html#/login" class="btn btn-secondary">Iniciar sesion</a>';
                }
                actions.innerHTML += '<a href="index.html#/contacto" class="btn btn-primary">Contactar</a>';
            }

            showContent();
            loadReviews(resourceId);
        });
    }

    document.addEventListener('auralis:ready', function () {
        rewriteSiteLinks(document.getElementById('navbar-container'));
        rewriteSiteLinks(document.getElementById('footer-container'));
        initResourcePage();
    });
})();
