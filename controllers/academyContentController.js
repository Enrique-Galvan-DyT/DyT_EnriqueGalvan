// controllers/academyContentController.js

// --- CONTENT ---
async function getResourceContent(resourceId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getResourceContentRoute, { id: resourceId }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response.success !== false ? (response.data || []) : []);
            },
            error: function () { resolve([]); }
        });
    });
}

async function addResourceContent(resourceId, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(addResourceContentRoute, { id: resourceId }),
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al agregar contenido");
                resolve({ success: false });
            }
        });
    });
}

async function updateContent(contentId, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateContentRoute, { id: contentId }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al actualizar contenido");
                resolve({ success: false });
            }
        });
    });
}

async function deleteContent(contentId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteContentRoute, { id: contentId }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al eliminar contenido");
                resolve({ success: false });
            }
        });
    });
}

async function reorderContent(orders) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: reorderContentRoute,
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ orders: orders }),
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al reordenar contenido");
                resolve({ success: false });
            }
        });
    });
}

// --- LESSONS ---
async function getResourceLessons(resourceId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getResourceLessonsRoute, { id: resourceId }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response.success !== false ? (response.data || []) : []);
            },
            error: function () { resolve([]); }
        });
    });
}

async function addResourceLesson(resourceId, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(addResourceLessonRoute, { id: resourceId }),
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al agregar leccion");
                resolve({ success: false });
            }
        });
    });
}

async function updateLesson(lessonId, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateLessonRoute, { id: lessonId }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al actualizar leccion");
                resolve({ success: false });
            }
        });
    });
}

async function deleteLesson(lessonId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteLessonRoute, { id: lessonId }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) { resolve(response); },
            error: function () {
                showError("Error al eliminar leccion");
                resolve({ success: false });
            }
        });
    });
}
