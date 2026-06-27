const config = require('./config');

class ConvexClient {
  constructor() {
    this.url = config.convexUrl;
    this.adminKey = config.convexKey;
  }

  async query(path, args = {}) {
    const url = `${this.url}/api/query/${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.adminKey ? { 'Authorization': `Bearer ${this.adminKey}` } : {}),
      },
      body: JSON.stringify({ args }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Convex query ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }

  async mutation(path, args = {}) {
    const url = `${this.url}/api/mutation/${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.adminKey ? { 'Authorization': `Bearer ${this.adminKey}` } : {}),
      },
      body: JSON.stringify({ args }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Convex mutation ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }
}

module.exports = new ConvexClient();
