// public/js/auth.js — DyTAuth module

var DyTAuth = (function () {
  var STORAGE_KEY = 'DyT_EG_user';

  function getUser() {
    return getLocalStorage(STORAGE_KEY);
  }

  function getToken() {
    var user = getUser();
    return user ? user.token : null;
  }

  function isLoggedIn() {
    var user = getUser();
    return !!(user && user.token);
  }

  function isAdmin() {
    var user = getUser();
    return !!(user && user.role === 'admin');
  }

  function setUser(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function clearUser() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function dispatchChange() {
    document.dispatchEvent(new CustomEvent('auth:changed'));
  }

  async function login(email, password, turnstileToken) {
    var res = await authLogin(email, password, turnstileToken);
    if (!res.success) throw new Error(res.message);
    setUser({
      token: res.token,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role,
      id: res.user.id
    });
    dispatchChange();
    return res.user;
  }

  async function register(name, email, password, turnstileToken) {
    var res = await authRegister(name, email, password, turnstileToken);
    if (!res.success) throw new Error(res.message);
    return res.user || res;
  }

  function logout() {
    clearUser();
    dispatchChange();
    navigateTo('');
  }

  return {
    getUser: getUser,
    getToken: getToken,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    login: login,
    register: register,
    logout: logout
  };
})();

window.DyTAuth = DyTAuth;
