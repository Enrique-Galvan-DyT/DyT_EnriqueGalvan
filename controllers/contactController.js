// controllers/contactController.js

// --- SUBMIT CONTACT FORM ---
async function submitContact(data) {
    return new Promise(function (resolve) {
        $.ajax({
            url: contactSubmitRoute,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al enviar el mensaje";
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

// --- GET ALL INQUIRIES (admin) ---
async function getContactInquiries() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: getContactInquiriesRoute,
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

// --- MARK AS READ (admin) ---
async function markContactAsRead(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(markContactAsReadRoute, { id: id }),
            type: "PUT",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                resolve({ success: false });
            }
        });
    });
}

// --- DELETE INQUIRY (admin) ---
async function deleteContactInquiry(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(deleteContactInquiryRoute, { id: id }),
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                var msg = "Error al eliminar el mensaje";
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
