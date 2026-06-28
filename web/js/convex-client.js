class ConvexClient {
  constructor(url) {
    this.url = url || window.__CONVEX_URL__ || 'https://amiable-crocodile-549.convex.cloud';
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  async request(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    const res = await fetch(`${this.url}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || data.error);
    return data;
  }

  async query(name, args = {}) {
    return this.request('/api/query', { path: name, args });
  }

  async mutation(name, args = {}) {
    return this.request('/api/mutation', { path: name, args });
  }

  async action(name, args = {}) {
    return this.request('/api/action', { path: name, args });
  }

  // Auth helpers
  async register(email, name, password) {
    const result = await this.mutation('auth:register', { email, name, password });
    if (result.userId) {
      this.authToken = result.userId;
    }
    return result;
  }

  async login(email, password) {
    const result = await this.mutation('auth:login', { email, password });
    if (result.userId) {
      sessionStorage.setItem('hackstation_user', JSON.stringify(result));
      this.authToken = result.userId;
    }
    return result;
  }

  logout() {
    sessionStorage.removeItem('hackstation_user');
    this.clearAuthToken();
  }

  getCurrentUser() {
    const data = sessionStorage.getItem('hackstation_user');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}

const convex = new ConvexClient();
