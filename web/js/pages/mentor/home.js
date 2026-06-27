window.mentorPages = window.mentorPages || {};
const EVENT_ID = 'default';

window.mentorPages.renderHome = async function() {
  const mentor = convex.getCurrentUser();
  const mentorId = mentor?.userId;

  const [groups, helpRequests] = await Promise.all([
    convex.query('groups:listByMentor', { mentorId, eventId: EVENT_ID }).catch(() => []),
    convex.query('helpRequests:listByEvent', { eventId: EVENT_ID }).catch(() => []),
  ]);

  const assignedGroups = groups?.length || 0;
  const openRequests = helpRequests?.filter(r => r.status === 'open')?.length || 0;
  const resolvedToday = helpRequests?.filter(r => r.status === 'resolved')?.length || 0;
  const recent = (helpRequests || []).slice(0, 5);

  return `
    <div class="page-header">
      <div>
        <h2>Mentor Dashboard</h2>
        <p class="text-muted">Overview of your assigned groups and help queue</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--accent-light, rgba(99,102,241,0.1));">
          <i data-lucide="users" style="width: 20px; height: 20px; color: var(--accent, #6366f1);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${assignedGroups}</span>
          <span class="stat-label">Assigned Groups</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--warning-light, rgba(245,158,11,0.1));">
          <i data-lucide="help-circle" style="width: 20px; height: 20px; color: var(--warning, #f59e0b);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${openRequests}</span>
          <span class="stat-label">Open Requests</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--success-light, rgba(34,197,94,0.1));">
          <i data-lucide="check-circle" style="width: 20px; height: 20px; color: var(--success, #22c55e);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${resolvedToday}</span>
          <span class="stat-label">Resolved</span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="card-header">
        <h3>Recent Help Requests</h3>
      </div>
      <div class="card-body">
        ${recent.length === 0 ? Utils.emptyState('No recent requests', 'Help requests will appear here') : `
        <table class="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(r => `
            <tr onclick="router.navigate('/mentor/help-queue')" style="cursor: pointer;">
              <td>${Utils.escapeHtml(r.groupName || '—')}</td>
              <td>${Utils.escapeHtml(r.topic || '—')}</td>
              <td><span class="badge badge-${r.status === 'open' ? 'warning' : r.status === 'assigned' ? 'info' : 'success'}">${Utils.escapeHtml(r.status)}</span></td>
              <td class="text-muted">${Utils.formatDate(r._creationTime)}</td>
            </tr>`).join('')}
          </tbody>
        </table>`}
      </div>
    </div>
  `;
};
