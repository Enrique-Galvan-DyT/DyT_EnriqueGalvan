// controllers/projectDetailController.js — Lógica de la página project-detail.html (detalle de proyecto)

(function () {
    if (document.body.getAttribute('data-page') !== 'project-detail') return;

    function getParam(name) {
        var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        if (m) return decodeURIComponent(m[1]);
        var h = window.location.hash.replace('#/', '').replace('#', '');
        return h.split('/')[0] || '';
    }

    var projectId = getParam('id');

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    // Rewrite de links del navbar/footer para que apunten al SPA index.html
    function rewriteSiteLinks(root) {
        if (!root) return;
        root.querySelectorAll('a[href^="#"]').forEach(function (a) {
            var h = a.getAttribute('href');
            a.setAttribute('href', (h === '#') ? 'index.html' : 'index.html' + h);
        });
    }

    var siteBaseUrl = 'https://enrique-galvan-dyt.github.io/DyT_EnriqueGalvan';

    function setProjectMeta(name, desc, image) {
        var fullTitle = (name || 'Proyecto') + ' | Desarrollo y Tecnología - Enrique Galván';
        var canonical = siteBaseUrl + '/project-detail.html?id=' + encodeURIComponent(projectId);
        document.title = fullTitle;
        setLinkCanonical(canonical);
        setMetaContent('meta[property="og:url"]', canonical);
        setMetaContent('meta[property="og:title"]', fullTitle);
        setMetaContent('meta[name="twitter:title"]', fullTitle);
        if (desc) {
            setMetaContent('meta[name="description"]', desc);
            setMetaContent('meta[property="og:description"]', desc);
            setMetaContent('meta[name="twitter:description"]', desc);
        }
        if (image) {
            setMetaContent('meta[property="og:image"]', image);
            setMetaContent('meta[name="twitter:image"]', image);
        }
        setProjectJSONLD(name || 'Proyecto', desc, canonical, image);
    }

    function setProjectJSONLD(name, desc, canonical, image) {
        var script = document.getElementById('projectJSONLD');
        if (!script) {
            script = document.createElement('script');
            script.id = 'projectJSONLD';
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        var ld = {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: name,
            description: desc || '',
            url: canonical,
            inLanguage: 'es',
            author: {
                '@type': 'Organization',
                name: 'DyT_EG',
                url: siteBaseUrl + '/'
            }
        };
        if (image) ld.image = image;
        script.textContent = JSON.stringify(ld);
    }

    function initProjectPage() {
        var loadingEl = document.getElementById('projectLoading');
        var errorEl = document.getElementById('projectError');
        var contentEl = document.getElementById('projectContent');

        if (!projectId) {
            showProjectError('ID de proyecto no valido');
            return;
        }

        function showProjectError(msg) {
            loadingEl.style.display = 'none';
            document.getElementById('projectErrorMsg').textContent = msg;
            errorEl.style.display = 'flex';
            contentEl.style.display = 'none';
        }

        function showContent() {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'none';
            contentEl.style.display = 'block';
        }

        function isPdfUrl(url) {
            return /\.pdf(\?|$)/i.test(url);
        }

        function isImageUrl(url) {
            return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
        }

        getProject(projectId).then(function (project) {
            if (!project) {
                showProjectError('Proyecto no encontrado');
                return;
            }

            var name = project.name || '';
            var desc = project.description || '';
            var status = project.status || '';
            var content = project.content || [];

            var statusLabels = { planning: 'Planeacion', in_progress: 'En Progreso', completed: 'Completado', maintenance: 'Mantenimiento', archived: 'Archivado' };

            // Filter out thumbnail from content
            var files = content.filter(function (c) {
                var ft = (c.fileType || '');
                var fn = (c.fileName || '');
                return ft !== 'image/thumbnail' && fn !== '_thumbnail_';
            });

            document.getElementById('projectName').textContent = name;
            document.getElementById('projectDesc').textContent = desc;

            var projectImage = project.imageUrl || '';
            if (!projectImage) {
                (content || []).forEach(function (c) {
                    var ft = (c.fileType || '');
                    var fn = (c.fileName || '');
                    if (ft === 'image/thumbnail' || String(fn).indexOf('_thumbnail_') !== -1) {
                        if (!projectImage) projectImage = c.fileUrl || c.FileUrl || '';
                    }
                });
            }
            setProjectMeta(name, desc, projectImage);

            var statusEl = document.getElementById('projectStatus');
            statusEl.textContent = statusLabels[status] || status;
            statusEl.className = 'project-detail-status ' + status;

            // --- BODY CONTENT (CKEditor + placeholder injection) ---
            var bodyHtml = project.bodyHtml || '';
            var bodySection = document.getElementById('bodySection');

            if (bodyHtml) {
                bodySection.style.display = '';

                files.sort(function (a, b) {
                    return (a.sortOrder || 0) - (b.sortOrder || 0);
                });

                var renderedHtml = bodyHtml.replace(/\{\{file:(\d+)\}\}/g, function (match, idx) {
                    var f = files[parseInt(idx)];
                    if (!f) return '<span style="color:var(--accent-burgundy);">[Archivo no encontrado]</span>';
                    return generateFileEmbed(f);
                });

                if (typeof DOMPurify !== 'undefined') {
                    renderedHtml = DOMPurify.sanitize(renderedHtml, {
                        ALLOWED_TAGS: ['p','br','strong','em','u','s','ul','ol','li','a','blockquote','h3','h4','h5','img','table','thead','tbody','tr','td','th','hr','pre','code','span','div','embed','video','source','iframe'],
                        ALLOWED_ATTR: ['href','target','rel','src','alt','class','style','width','height','type','frameborder','allowfullscreen','controlslist','disablepictureinpicture','oncontextmenu','allow']
                    });
                }

                document.getElementById('bodyContainer').innerHTML = renderedHtml;
            }
            else if (files.length > 0) {
                bodySection.style.display = '';
                var fallbackHtml = '<div class="resource-files-container">';
                files.sort(function (a, b) {
                    return (a.sortOrder || 0) - (b.sortOrder || 0);
                });
                files.forEach(function (f) {
                    fallbackHtml += generateFileEmbed(f);
                });
                fallbackHtml += '</div>';
                document.getElementById('bodyContainer').innerHTML = fallbackHtml;
            }

            function generateFileEmbed(f) {
                var fName = f.fileName || '';
                var fUrl = f.fileUrl || '';
                var fSize = f.fileSize || '';
                var fType = f.fileType || '';
                var fDesc = f.description || '';
                var hasDesc = fDesc.length > 0;
                var contentId = f.id;

                if (fType.indexOf('pdf') !== -1 || isPdfUrl(fName) || isPdfUrl(fUrl)) {
                    var apiUrl = getProjectFileRoute.replace('[id]', contentId);
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

            showContent();

            setupApproval(project);
            loadThread(project);
            loadTestimonial(project);
        });

        // ─────────────────────────
        //  APROBACION DE PUBLICACION
        // ─────────────────────────
        function setupApproval(project) {
            var section = document.getElementById('approvalSection');
            if (!section) return;

            var user = getLocalStorage('DyT_EG_user');
            var isOwnerClient = user && project.idUser === user.id;
            var isAdmin = user && user.role === 'admin';

            if (!isOwnerClient && !isAdmin) {
                section.style.display = 'none';
                return;
            }

            section.style.display = '';

            var render = function () {
                var visible = !!project.clientApproved;
                section.innerHTML =
                    '<div class="approval-block' + (visible ? ' approval-block--done' : '') + '">' +
                    '<div class="approval-block-icon"><i class="ph-light ph-globe-hemisphere-west"></i></div>' +
                    '<div class="approval-block-text">' +
                    '<strong>' + (visible ? 'Proyecto publicado' : 'Proyecto oculto') + '</strong>' +
                    '<span>' + (visible ? 'Este proyecto es visible publicamente en nuestro portafolio.' : 'Este proyecto no es visible publicamente hasta que lo permitas.') + '</span>' +
                    '</div>' +
                    '<button type="button" class="vis-toggle" data-project="' + projectId + '" data-approved="' + (visible ? 'true' : 'false') + '">' +
                    '<span class="vis-toggle-switch"><span class="vis-toggle-knob"></span></span>' +
                    '<span class="vis-toggle-text">' + (visible ? 'Ocultar visibilidad' : 'Permitir visibilidad') + '</span>' +
                    '</button>' +
                    '</div>';
            };

            render();

            section.addEventListener('click', function (e) {
                var toggle = e.target && e.target.closest ? e.target.closest('.vis-toggle') : null;
                if (!toggle) return;
                var newState = toggle.getAttribute('data-approved') !== 'true';
                toggle.disabled = true;
                approveProject(projectId, newState).then(function (res) {
                    if (res.success !== false) {
                        project.clientApproved = newState;
                        render();
                    } else {
                        toggle.disabled = false;
                        showError(res.message || 'Error al cambiar la visibilidad del proyecto');
                    }
                });
            });
        }

        // ─────────────────────────
        //  SEGUIMIENTO DEL PROYECTO
        // ─────────────────────────
        var threadBound = false;

        function loadThread(project) {
            var section = document.getElementById('followUpSection');
            if (!section) return;

            var user = getLocalStorage('DyT_EG_user');
            var isOwnerClient = user && project.idUser === user.id;
            var isAdmin = user && user.role === 'admin';

            if (!isOwnerClient && !isAdmin) {
                section.style.display = 'none';
                return;
            }

            section.style.display = '';

            getProjectThread(projectId).then(function (data) {
                var comments = (data && data.comments) || [];
                var list = document.getElementById('threadList');
                if (!comments.length) {
                    list.innerHTML = '<div class="project-thread-empty" style="margin-block: 2rem;">No hay avances aun</div>';
                } else {
                    list.innerHTML = comments.map(function (c) {
                        return '<div class="comment-card">' +
                            '<div class="comment-header">' +
                            '<span class="comment-author">' + escapeHtml(c.userName || 'Usuario') + '</span>' +
                            '<span class="comment-date">' + formatDate(c.createdAt) + '</span>' +
                            '</div>' +
                            '<div class="comment-body">' + escapeHtml(c.content).replace(/\n/g, '<br>') + '</div>' +
                            '</div>';
                    }).join('');
                }

                var form = document.getElementById('threadForm');
                form.style.display = isAdmin ? '' : 'none';
            });

            if (!threadBound) {
                threadBound = true;
                var btn = document.getElementById('threadBtn');
                if (btn) {
                    btn.addEventListener('click', function () {
                        var input = document.getElementById('threadContent');
                        var content = input.value.trim();
                        if (!content) return;
                        btn.disabled = true;
                        addProjectThreadComment(projectId, content).then(function () {
                            btn.disabled = false;
                            input.value = '';
                            loadThread(project);
                        });
                    });
                }
            }
        }

        // ─────────────────────────
        //  TESTIMONIO
        // ─────────────────────────
        function loadTestimonial(project) {
            var user = getLocalStorage('DyT_EG_user');
            var isAssignedClient = user && project.idUser === user.id;

            getProjectTestimonial(projectId).then(function (testimonial) {
                var loading = document.getElementById('testimonialLoading');
                var display = document.getElementById('testimonialDisplay');
                var formWrap = document.getElementById('testimonialFormWrap');

                if (testimonial) {
                    loading.style.display = 'none';
                    formWrap.style.display = 'none';
                    display.style.display = '';
                    renderTestimonial(display, testimonial);
                } else if (isAssignedClient) {
                    loading.style.display = 'none';
                    display.style.display = 'none';
                    formWrap.style.display = '';
                    buildTestimonialForm(formWrap, projectId, function () {
                        loading.style.display = 'none';
                        formWrap.style.display = 'none';
                        display.style.display = '';
                        getProjectTestimonial(projectId).then(function (updated) {
                            if (updated) renderTestimonial(display, updated);
                        });
                    });
                } else {
                    var section = document.getElementById('testimonialSection');
                    if (section) section.style.display = 'none';
                }
            });
        }

        function renderTestimonial(el, testimonial) {
            var tName = testimonial.clientName || '';
            var initial = (tName || 'C').charAt(0).toUpperCase();
            var html =
                '<div class="testimonial-block">' +
                '<div class="testimonial-block-header">' +
                '<span class="stars-display" id="tStars"></span>' +
                '</div>' +
                '<p class="testimonial-text">"' + escapeHtml(testimonial.content || '') + '"</p>' +
                '<div class="testimonial-author">' +
                '<div class="testimonial-avatar" style="background: var(--accent-primary);">' + escapeHtml(initial) + '</div>' +
                '<div>' +
                '<strong>' + escapeHtml(tName) + '</strong>' +
                '<span class="testimonial-date">' + escapeHtml(formatTestDate(testimonial.createdAt)) + '</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            el.innerHTML = html;
            renderStars(el.querySelector('#tStars'), testimonial.rating);
        }

        function buildTestimonialForm(el, projectId, onSuccess) {
            var html =
                '<div class="testimonial-block">' +
                '<div class="testimonial-block-header">' +
                '<p class="testimonial-block-title" style="margin:0;">Valora este proyecto</p>' +
                '</div>' +
                '<form class="testimonial-form" id="testimonialForm">' +
                '<div class="testimonial-form-field">' +
                '<label>Tu valoracion</label>' +
                '<div id="testimonialStars" class="star-selector"></div>' +
                '</div>' +
                '<div class="testimonial-form-field">' +
                '<label>Tu testimonio</label>' +
                '<textarea id="testimonialContent" maxlength="1000" placeholder="Cuenta tu experiencia con este proyecto..."></textarea>' +
                '</div>' +
                '<div class="testimonial-form-error" id="testimonialFormError" style="display:none;"></div>' +
                '<button type="submit" class="btn btn-primary" id="testimonialSubmit">' +
                '<i class="ph-light ph-paper-plane-tilt"></i> Publicar testimonio' +
                '</button>' +
                '</form>' +
                '</div>';
            el.innerHTML = html;

            var stars = document.getElementById('testimonialStars');
            if (typeof renderStarSelector === 'function') renderStarSelector(stars);

            document.getElementById('testimonialForm').addEventListener('submit', function (e) {
                e.preventDefault();
                var errorEl = document.getElementById('testimonialFormError');
                var submitBtn = document.getElementById('testimonialSubmit');
                var rating = (typeof stars.getRating === 'function') ? stars.getRating() : 0;
                var content = document.getElementById('testimonialContent').value.trim();

                errorEl.style.display = 'none';
                if (rating <= 0) {
                    errorEl.textContent = 'Selecciona una valoracion con estrellas';
                    errorEl.style.display = '';
                    return;
                }
                if (!content) {
                    errorEl.textContent = 'Escribe tu testimonio';
                    errorEl.style.display = '';
                    return;
                }

                submitBtn.disabled = true;
                createTestimonial({ projectId: projectId, rating: rating, content: content }).then(function (res) {
                    submitBtn.disabled = false;
                    if (res && res.success) {
                        if (typeof onSuccess === 'function') onSuccess();
                    } else {
                        errorEl.textContent = (res && res.message) || 'Error al publicar el testimonio';
                        errorEl.style.display = '';
                    }
                });
            });
        }

        function formatTestDate(dateStr) {
            if (!dateStr) return '';
            var d = new Date(dateStr);
            var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        }

        function formatDate(dateStr) {
            if (!dateStr) return '';
            var d = new Date(dateStr);
            var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' +
                String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        }

        document.addEventListener('contextmenu', function (e) {
            if (e.target.closest('.resource-video-container') || e.target.closest('.resource-file-viewer')) {
                e.preventDefault();
                return false;
            }
        });
    }

    document.addEventListener('auralis:ready', function () {
        rewriteSiteLinks(document.getElementById('navbar-container'));
        rewriteSiteLinks(document.getElementById('footer-container'));
        initProjectPage();
    });
})();
