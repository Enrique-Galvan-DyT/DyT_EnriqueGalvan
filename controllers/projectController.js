// controllers/projectController.js

// --- GET ALL PROJECTS ---
async function getProjects() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: getProjectsRoute,
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

// --- GET SINGLE PROJECT ---
async function getProject(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getProjectByIdRoute, { id: id }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
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

// --- CREATE PROJECT (admin) ---
async function createProject(data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: createProjectRoute,
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al crear el proyecto";
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

// --- UPDATE PROJECT (admin) ---
async function updateProject(id, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateProjectRoute, { id: id }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al actualizar el proyecto";
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

// --- DELETE PROJECT (admin) ---
async function deleteProject(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteProjectRoute, { id: id }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al eliminar el proyecto";
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

// --- APPROVE / RETRACT PROJECT (cliente asignado o admin) ---
async function approveProject(id, approved) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(approveProjectRoute, { id: id }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ Approved: approved !== false }),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al cambiar la visibilidad del proyecto";
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

// --- GET PROJECT CONTENT ---
async function getProjectContent(projectId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getProjectContentRoute, { id: projectId }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error al obtener contenido del proyecto");
                resolve({ success: false, data: [] });
            }
        });
    });
}

// --- ADD PROJECT CONTENT (admin) ---
async function addProjectContent(projectId, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(addProjectContentRoute, { id: projectId }),
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al agregar contenido";
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

// --- UPDATE PROJECT CONTENT (admin) ---
async function updateProjectContent(id, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateProjectContentRoute, { id: id }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al actualizar contenido";
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

// --- DELETE PROJECT CONTENT (admin) ---
async function deleteProjectContent(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteProjectContentRoute, { id: id }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al eliminar contenido";
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

// --- GET CLIENTS (admin) ---
async function getClients() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: getClientsRoute,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
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

// --- REORDER PROJECT CONTENT (admin) ---
async function reorderProjectContent(orders) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: reorderProjectContentRoute,
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ Orders: orders }),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al reordenar contenido";
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

// --- GET PROJECT THREAD (seguimiento) ---
async function getProjectThread(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getProjectThreadRoute, { id: id }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || { ticket: null, comments: [] });
                } else {
                    showError(response.message);
                    resolve({ ticket: null, comments: [] });
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve({ ticket: null, comments: [] });
            }
        });
    });
}

// --- ADD PROJECT THREAD COMMENT (admin) ---
async function addProjectThreadComment(id, content) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(addProjectThreadCommentRoute, { id: id }),
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ Content: content }),
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve(null);
                }
            },
            error: function (xhr) {
                var msg = "Error al publicar el avance";
                try {
                    var body = JSON.parse(xhr.responseText);
                    if (body.message) msg = body.message;
                } catch (e) {}
                showError(msg);
                resolve(null);
            }
        });
    });
}
