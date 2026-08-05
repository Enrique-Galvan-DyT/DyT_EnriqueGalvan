// controllers/authController.js

// --- LOGIN ---
async function authLogin(email, password, turnstileToken) {
    return new Promise(function (resolve) {
        $.ajax({
            url: authLoginRoute,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ Email: email, Password: password, TurnstileToken: turnstileToken }),
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- REGISTER ---
async function authRegister(name, email, password, turnstileToken) {
    return new Promise(function (resolve) {
        $.ajax({
            url: authRegisterRoute,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ Name: name, Email: email, Password: password, TurnstileToken: turnstileToken }),
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- GET ME ---
async function authGetMe() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: authMeRoute,
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                resolve(null);
            }
        });
    });
}

// --- VERIFY ACCOUNT ---
async function authVerify(token) {
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(authVerifyRoute, { token: encodeURIComponent(token) }),
            type: "GET",
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- GET PENDING USERS (admin) ---
async function authGetPending() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: authPendingRoute,
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

// --- ACTIVATE USER (admin) ---
async function authActivateUser(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(authActivateRoute, { id: id }),
            type: "POST",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- GET VERIFY LINK (admin) ---
async function authGetVerifyLink(id) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: buildUrl(authVerifyLinkRoute, { id: id }),
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- UPDATE PROFILE (name) ---
async function authUpdateProfile(name) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: authProfileRoute,
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ Name: name }),
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- CHANGE PASSWORD ---
async function authChangePassword(currentPassword, newPassword) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: authPasswordRoute,
            type: "PUT",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ CurrentPassword: currentPassword, NewPassword: newPassword }),
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}

// --- DELETE ACCOUNT ---
async function authDeleteAccount() {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    return new Promise(function (resolve) {
        $.ajax({
            url: authDeleteAccountRoute,
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                showError("Error de conexion");
                resolve({ success: false, message: "Error de conexion" });
            }
        });
    });
}
