window.organiserPages = window.organiserPages || {};

var EVENT_ID = 'event1';

window.organiserPages.renderDashboard = async function () {
  const [stats, activity] = await Promise.all([
    convex.query('events:getStats', { eventId: EVENT_ID }).catch(() => null),
    convex.query('events:getActivity', { eventId: EVENT_ID, limit: 10 }).catch(() => []),
  ]);

  return `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="text-muted">Event overview at a glance</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="window.organiserPages.renderAnnouncements()">
          <i data-lucide="megaphone" style="width: 18px; height: 18px;"></i> Announce
        </button>
        <button class="btn btn-primary" onclick="window.organiserPages.renderTimer()">
          <i data-lucide="clock" style="width: 18px; height: 18px;"></i> Timer
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--accent-bg);">
          <i data-lucide="users" style="width: 24px; height: 24px; color: var(--accent);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats?.participants ?? 0}</span>
          <span class="stat-label">Participants</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--success-bg);">
          <i data-lucide="layers" style="width: 24px; height: 24px; color: var(--success);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats?.groups ?? 0}</span>
          <span class="stat-label">Groups</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--warning-bg);">
          <i data-lucide="graduation-cap" style="width: 24px; height: 24px; color: var(--warning);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats?.mentors ?? 0}</span>
          <span class="stat-label">Mentors</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--danger-bg);">
          <i data-lucide="star" style="width: 24px; height: 24px; color: var(--danger);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats?.judges ?? 0}</span>
          <span class="stat-label">Judges</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <h3>Recent Activity</h3>
      ${activity.length === 0
        ? Utils.emptyState('No recent activity', 'Activity will appear here as things happen.')
        : `<div class="activity-list">
          ${activity.map(a => `
            <div class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-content">
                <span>${Utils.escapeHtml(a.message)}</span>
                <small class="text-muted">${Utils.formatDate(a.timestamp)}</small>
              </div>
            </div>
          `).join('')}
        </div>`
      }
    </div>
  `;
};
