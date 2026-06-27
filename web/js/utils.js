const Utils = {
  toast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  formatDateShort(ts) {
    return new Date(ts).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });
  },

  showModal(html) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = html;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });
    document.body.appendChild(backdrop);
    return backdrop;
  },

  closeModal(modal) {
    if (modal) modal.remove();
  },

  showSpinner() {
    return '<div class="spinner spinner-lg" style="margin: 64px auto;"></div>';
  },

  showError(message) {
    return `<div class="empty-state"><h3>${this.escapeHtml(message)}</h3><p>Try refreshing the page.</p></div>`;
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },

  getRoleBadgeClass(role) {
    return `role-${role}`;
  },

  getStatusBadgeText(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  },

  getPriorityClass(priority) {
    return `priority-${priority}`;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  spinner() {
    return '<div class="spinner" style="margin: 32px auto;"></div>';
  },

  emptyState(title, description) {
    return `<div class="empty-state"><h3>${this.escapeHtml(title)}</h3><p>${this.escapeHtml(description)}</p></div>`;
  },
};
