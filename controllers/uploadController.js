// controllers/uploadController.js

function uploadToCloudinary(file, type) {
    var user = getLocalStorage('DyT_EG_user');
    var token = user ? user.token : null;
    var url = type === 'image' ? uploadImageRoute : uploadDocumentRoute;

    return new Promise(function (resolve) {
        var formData = new FormData();
        formData.append('file', file);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.onload = function () {
            try {
                var res = JSON.parse(xhr.responseText);
                resolve(res);
            } catch (e) {
                showError('Error al procesar respuesta del servidor');
                resolve({ success: false });
            }
        };
        xhr.onerror = function () {
            showError('Error de conexion con el servidor');
            resolve({ success: false });
        };
        xhr.send(formData);
    });
}

function uploadImage(file) {
    return uploadToCloudinary(file, 'image');
}

function uploadDocument(file) {
    return uploadToCloudinary(file, 'document');
}
