window.organiserPages = window.organiserPages || {};

var EVENT_ID = 'event1';

window.organiserPages.renderStats = async function () {
  const [stats, registrations, groups] = await Promise.all([
    convex.query('events:getStats', { eventId: EVENT_ID }).catch(() => ({})),
    convex.query('registrations:list', { eventId: EVENT_ID }).catch(() => []),
    convex.query('groups:list', { eventId: EVENT_ID }).catch(() => []),
  ]);

  function exportCSV() {
    const rows = [
      ['Name', 'Email', 'Status', 'Group', 'Registered'],
      ...registrations.map(r => [
        r.name || '',
        r.email || '',
        r.status || 'pending',
        r.groupName || '',
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
      ]),
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${EVENT_ID}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Utils.toast('CSV exported', 'success');
  }

  const pendingRegs = registrations.filter(r => r.status === 'pending').length;
  const acceptedRegs = registrations.filter(r => r.status === 'accepted').length;
  const rejectedRegs = registrations.filter(r => r.status === 'rejected').length;
  const totalRegs = registrations.length;
  const acceptanceRate = totalRegs > 0 ? ((acceptedRegs / totalRegs) * 100).toFixed(1) : '0.0';
  const avgGroupSize = groups.length > 0
    ? (groups.reduce((sum, g) => sum + (g.memberCount || 0), 0) / groups.length).toFixed(1)
    : '0.0';

  return `
    <div class="page-header">
      <div>
        <h1>Statistics</h1>
        <p class="text-muted">Event data and export</p>
      </div>
      <button class="btn btn-secondary" onclick="(${exportCSV.toString()})()">
        <i data-lucide="download" style="width: 18px; height: 18px;"></i> Export CSV
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--accent-bg);">
          <i data-lucide="users" style="width: 24px; height: 24px; color: var(--accent);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats?.participants ?? 0}</span>
          <span class="stat-label">Total Participants</span>
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
          <i data-lucide="check-circle" style="width: 24px; height: 24px; color: var(--warning);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${acceptanceRate}%</span>
          <span class="stat-label">Acceptance Rate</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--info-bg);">
          <i data-lucide="users" style="width: 24px; height: 24px; color: var(--info);"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${avgGroupSize}</span>
          <span class="stat-label">Avg Group Size</span>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
      <div class="card">
        <div class="card-header">
          <h3>Registration Breakdown</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Total</span>
              <strong>${totalRegs}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; color: var(--warning);">
              <span>Pending</span>
              <strong>${pendingRegs}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; color: var(--success);">
              <span>Accepted</span>
              <strong>${acceptedRegs}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; color: var(--danger);">
              <span>Rejected</span>
              <strong>${rejectedRegs}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Quick Info</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Mentors</span>
              <strong>${stats?.mentors ?? 0}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Judges</span>
              <strong>${stats?.judges ?? 0}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Sponsors</span>
              <strong>${stats?.sponsors ?? 0}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Announcements</span>
              <strong>${stats?.announcements ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
