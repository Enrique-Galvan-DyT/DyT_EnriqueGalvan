// controllers/academyController.js

// --- GET ALL RESOURCES ---
async function getAcademyResources() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: getAcademyResourcesRoute,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve([]);
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve([]);
            }
        });
    });
}

// --- GET RESOURCES BY CATEGORY ---
async function getAcademyResourcesByCategory(category) {
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getAcademyResourcesByCategoryRoute, { category: category }),
            type: "GET",
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve([]);
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve([]);
            }
        });
    });
}

// --- GET SINGLE RESOURCE ---
async function getAcademyResource(id) {
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getAcademyResourceRoute, { id: id }),
            type: "GET",
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve(null);
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve(null);
            }
        });
    });
}

// --- CREATE RESOURCE (admin) ---
async function createAcademyResource(data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: createAcademyResourceRoute,
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al crear el recurso";
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

// --- UPDATE RESOURCE (admin) ---
async function updateAcademyResource(id, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateAcademyResourceRoute, { id: id }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al actualizar el recurso";
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

// --- DELETE RESOURCE (admin) ---
async function deleteAcademyResource(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteAcademyResourceRoute, { id: id }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al eliminar el recurso";
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
