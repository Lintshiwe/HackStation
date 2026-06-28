const Auth = {
  requireAuth() {
    if (!convex.isLoggedIn()) {
      router.navigate('/login');
      return false;
    }
    return true;
  },

  requireRole(role) {
    if (!this.requireAuth()) return false;
    const userRole = convex.getRole();
    if (userRole !== role && role !== 'any') {
      router.navigate(`/${userRole}/home`);
      return false;
    }
    return true;
  },

  redirectOnLogin() {
    const user = convex.getCurrentUser();
    if (user) {
      router.navigate(`/${user.role}/home`);
      return true;
    }
    return false;
  },

  async handleLogin(email, password) {
    try {
      const result = await convex.login(email, password);
      Utils.toast('Welcome back!', 'success');
      router.navigate(`/${result.role}/home`);
    } catch (err) {
      Utils.toast(err.message || 'Login failed', 'error');
    }
  },

  async handleRegister(email, name, password) {
    try {
      const result = await convex.register(email, name, password);
      sessionStorage.setItem('hackstation_user', JSON.stringify(result));
      Utils.toast('Account created! Welcome!', 'success');
      router.navigate(`/${result.role}/home`);
    } catch (err) {
      Utils.toast(err.message || 'Registration failed', 'error');
    }
  },

  handleLogout() {
    convex.logout();
    router.navigate('/login');
  },
};
