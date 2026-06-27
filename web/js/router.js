class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentPath() {
    return window.location.hash.slice(1) || '/login';
  }

  handleRoute() {
    const path = this.getCurrentPath();
    const handler = this.routes[path];

    if (handler) {
      handler();
    } else {
      // Check for parameterized routes
      for (const [pattern, routeHandler] of Object.entries(this.routes)) {
        const match = this.matchRoute(pattern, path);
        if (match) {
          routeHandler(match);
          return;
        }
      }
      this.navigate('/login');
    }
  }

  matchRoute(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  init() {
    this.handleRoute();
  }
}

const router = new Router();
