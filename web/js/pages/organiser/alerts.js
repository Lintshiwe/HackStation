window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderAlerts = async function () {
  const alerts = await convex.query('alerts:list', { eventId: EVENT_ID }).catch(() => []);

  function filterAlerts(tab) {
    document.querySelectorAll('.alert-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.alert-row').forEach(row => {
      const status = row.dataset.status;
      row.style.display = tab === 'all' || status === tab ? '' : 'none';
    });
    const activeTab = document.querySelector(`.alert-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
  }

  async function resolveAlert(id) {
    try {
      await convex.mutation('alerts:resolve', { alertId: id });
      Utils.toast('Alert resolved', 'success');
      window.organiserPages.renderAlerts();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  function showAssignDialog(id) {
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>Assign Alert</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Assign to</label>
            <input type="text" class="input" id="assignTo" placeholder="Name of mentor or organiser" required>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="confirmAssign">Assign</button>
        </div>
      </div>
    `);
    document.getElementById('confirmAssign').addEventListener('click', async () => {
      const assignedTo = document.getElementById('assignTo').value.trim();
      if (!assignedTo) return;
      try {
        await convex.mutation('alerts:assign', { alertId: id, assignedTo });
        Utils.toast('Alert assigned', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderAlerts();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  const counts = { open: 0, assigned: 0, resolved: 0 };
  alerts.forEach(a => {
    if (a.status === 'resolved') counts.resolved++;
    else if (a.assignedTo) counts.assigned++;
    else counts.open++;
  });

  return `
    <div class="page-header">
      <div>
        <h1>Alerts</h1>
        <p class="text-muted">Monitor and manage event alerts</p>
      </div>
    </div>

    <div style="display: flex; gap: 4px; margin-bottom: 16px; background: var(--bg-secondary); border-radius: 8px; padding: 4px;">
      <button class="btn btn-sm alert-tab active" data-tab="all" onclick="(${filterAlerts.toString()})('all')" style="flex: 1; justify-content: center;">All (${alerts.length})</button>
      <button class="btn btn-sm alert-tab" data-tab="open" onclick="(${filterAlerts.toString()})('open')" style="flex: 1; justify-content: center;">Open (${counts.open})</button>
      <button class="btn btn-sm alert-tab" data-tab="assigned" onclick="(${filterAlerts.toString()})('assigned')" style="flex: 1; justify-content: center;">Assigned (${counts.assigned})</button>
      <button class="btn btn-sm alert-tab" data-tab="resolved" onclick="(${filterAlerts.toString()})('resolved')" style="flex: 1; justify-content: center;">Resolved (${counts.resolved})</button>
    </div>

    ${alerts.length === 0
      ? Utils.emptyState('No alerts', 'Alerts from participants will appear here.')
      : `<div class="alert-list">
        ${alerts.map(a => `
          <div class="card alert-row" data-status="${a.status === 'resolved' ? 'resolved' : (a.assignedTo ? 'assigned' : 'open')}" style="margin-bottom: 8px; ${a.status === 'resolved' ? 'opacity: 0.6;' : ''}">
            <div class="card-body">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge badge-${a.severity === 'high' ? 'danger' : a.severity === 'medium' ? 'warning' : 'info'}">${Utils.escapeHtml(a.severity || 'low')}</span>
                    <strong>${Utils.escapeHtml(a.title)}</strong>
                  </div>
                  <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">${Utils.escapeHtml(a.message)}</p>
                  ${a.assignedTo ? `<p style="margin: 4px 0 0; font-size: 12px;"><strong>Assigned to:</strong> ${Utils.escapeHtml(a.assignedTo)}</p>` : ''}
                  <small class="text-muted">${Utils.formatDate(a.createdAt)}</small>
                </div>
                <div style="display: flex; gap: 4px; flex-shrink: 0;">
                  ${!a.assignedTo ? `<button class="btn btn-sm btn-secondary" onclick="(${showAssignDialog.toString()})('${a._id}')">Assign</button>` : ''}
                  ${a.status !== 'resolved' ? `<button class="btn btn-sm btn-primary" onclick="(${resolveAlert.toString()})('${a._id}')">Resolve</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>`
    }
  `;
};
