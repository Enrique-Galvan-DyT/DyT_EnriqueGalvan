// controllers/ticketController.js

// --- GET USER TICKETS ---
async function getUserTickets(filters) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    var query = '';
    if (filters) {
        var parts = [];
        if (filters.status) parts.push('status=' + filters.status);
        if (filters.category) parts.push('category=' + filters.category);
        if (filters.priority) parts.push('priority=' + filters.priority);
        if (filters.search) parts.push('search=' + encodeURIComponent(filters.search));
        if (filters.limit) parts.push('limit=' + filters.limit);
        if (parts.length) query = '?' + parts.join('&');
    }
    return new Promise(function (resolve) {
        $.ajax({
            url: getUserTicketsRoute + query,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve({ tickets: [], stats: {} });
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve({ tickets: [], stats: {} });
            }
        });
    });
}

// --- GET TICKET BY ID ---
async function getTicketById(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getTicketByIdRoute, { id: id }),
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

// --- CREATE TICKET ---
async function createTicket(data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: createTicketRoute,
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve(null);
                }
            },
            error: function (xhr) {
                var msg = "Error al crear el ticket";
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

// --- UPDATE TICKET STATUS (admin) ---
async function updateTicketStatus(id, status) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(updateTicketStatusRoute, { id: id }),
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ Status: status }),
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve(null);
                }
            },
            error: function (xhr) {
                var msg = "Error al actualizar el estado";
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

// --- GET TICKET COMMENTS ---
async function getTicketComments(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(getTicketCommentsRoute, { id: id }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || []);
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

// --- ADD TICKET COMMENT ---
async function addTicketComment(id, data) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(addTicketCommentRoute, { id: id }),
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve(null);
                }
            },
            error: function (xhr) {
                var msg = "Error al agregar comentario";
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

// --- GET ADMIN TICKETS ---
async function getAdminTickets(filters) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    var query = '';
    if (filters) {
        var parts = [];
        if (filters.status) parts.push('status=' + filters.status);
        if (filters.category) parts.push('category=' + filters.category);
        if (filters.priority) parts.push('priority=' + filters.priority);
        if (filters.search) parts.push('search=' + encodeURIComponent(filters.search));
        if (filters.limit) parts.push('limit=' + filters.limit);
        if (parts.length) query = '?' + parts.join('&');
    }
    return new Promise(function (resolve) {
        $.ajax({
            url: getAdminTicketsRoute + query,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve({ tickets: [] });
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve({ tickets: [] });
            }
        });
    });
}

// --- GET ADMIN TICKET STATS ---
async function getAdminTicketStats() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: getAdminTicketStatsRoute,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                if (response.success !== false) {
                    resolve(response.data || response);
                } else {
                    showError(response.message);
                    resolve({ total: 0, open: 0, inProgress: 0, resolved: 0 });
                }
            },
            error: function () {
                showError("Error de conexion con el servidor");
                resolve({ total: 0, open: 0, inProgress: 0, resolved: 0 });
            }
        });
    });
}
