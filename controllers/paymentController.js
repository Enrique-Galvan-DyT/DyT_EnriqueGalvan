// controllers/paymentController.js — Pagos con Conekta

// --- OBTENER CONFIG (llave pública) ---
function getPaymentConfig() {
    return new Promise(function (resolve) {
        $.ajax({
            url: paymentConfigRoute,
            type: "GET",
            success: function (response) {
                resolve((response && response.success && response.data) ? response.data : null);
            },
            error: function () {
                resolve(null);
            }
        });
    });
}

// --- CREAR CHECKOUT (token de Conekta) ---
async function createPaymentCheckout(resourceId, tokenId, customerName, customerEmail) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: paymentCheckoutRoute,
            type: "POST",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            contentType: "application/json",
            data: JSON.stringify({
                ResourceId: resourceId,
                TokenId: tokenId,
                CustomerName: customerName,
                CustomerEmail: customerEmail
            }),
            success: function (response) {
                resolve(response);
            },
            error: function () {
                resolve({ success: false, message: "Error de conexion con el servidor" });
            }
        });
    });
}

// --- STATUS (acceso del usuario al recurso) ---
async function getPaymentStatus(resourceId) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(paymentStatusRoute, { id: resourceId }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve((response && response.success && response.data) ? response.data : { owned: false });
            },
            error: function () {
                resolve({ owned: false });
            }
        });
    });
}

// --- ADMIN: historial de compras (planes y recursos) ---
async function getAdminPurchases() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: paymentAdminRoute,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve((response && response.success && response.data) ? response.data : []);
            },
            error: function () {
                resolve([]);
            }
        });
    });
}
