window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderRegistrations = async function () {
  const [registrations, event] = await Promise.all([
    convex.query('registrations:list', { eventId: EVENT_ID }).catch(() => []),
    convex.query('events:get', { eventId: EVENT_ID }).catch(() => ({})),
  ]);

  const regLink = event?.registrationLink || `${window.location.origin}/register/${EVENT_ID}`;

  function copyLink() {
    navigator.clipboard.writeText(regLink).then(() => {
      Utils.toast('Link copied!', 'success');
    }).catch(() => {
      Utils.toast('Failed to copy', 'error');
    });
  }

  function filterTable() {
    const search = document.getElementById('regSearch')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('regStatusFilter')?.value || '';
    document.querySelectorAll('.reg-row').forEach(row => {
      const name = row.dataset.name?.toLowerCase() || '';
      const email = row.dataset.email?.toLowerCase() || '';
      const status = row.dataset.status || '';
      const matchesSearch = name.includes(search) || email.includes(search);
      const matchesStatus = !statusFilter || status === statusFilter;
      row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  }

  async function updateStatus(regId, status) {
    try {
      await convex.mutation('registrations:updateStatus', { registrationId: regId, status });
      Utils.toast(`Registration ${status === 'accepted' ? 'accepted' : 'rejected'}`, 'success');
      window.organiserPages.renderRegistrations();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  return `
    <div class="page-header">
      <div>
        <h1>Registrations</h1>
        <p class="text-muted">View and manage participant registrations</p>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 500; font-size: 13px; white-space: nowrap;">Registration Link:</span>
      <code style="flex: 1; padding: 6px 10px; background: var(--bg-secondary); border-radius: 6px; font-size: 12px; overflow: hidden; text-overflow: ellipsis;">${Utils.escapeHtml(regLink)}</code>
      <button class="btn btn-secondary btn-sm" onclick="(${copyLink.toString()})()">
        <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy
      </button>
    </div>

    <div class="card" style="padding: 16px;">
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <input type="text" class="input" id="regSearch" placeholder="Search by name or email..." oninput="(${filterTable.toString()})()" style="flex: 1;">
        <select class="input" id="regStatusFilter" onchange="(${filterTable.toString()})()" style="width: 160px;">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      ${registrations.length === 0
        ? Utils.emptyState('No registrations', 'Registrations will appear here once participants sign up.')
        : `<table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${registrations.map(r => `
              <tr class="reg-row" data-name="${Utils.escapeHtml(r.name || '')}" data-email="${Utils.escapeHtml(r.email || '')}" data-status="${r.status || 'pending'}">
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="avatar avatar-sm">${Utils.getInitials(r.name)}</span>
                    ${Utils.escapeHtml(r.name || 'Unknown')}
                  </div>
                </td>
                <td>${Utils.escapeHtml(r.email || '')}</td>
                <td><span class="badge badge-${r.status || 'pending'}">${(r.status || 'pending').charAt(0).toUpperCase() + (r.status || 'pending').slice(1)}</span></td>
                <td class="text-muted">${Utils.formatDate(r.createdAt)}</td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    ${r.status !== 'accepted' ? `<button class="btn btn-sm btn-primary" onclick="(${updateStatus.toString()})('${r._id}', 'accepted')">Accept</button>` : ''}
                    ${r.status !== 'rejected' ? `<button class="btn btn-sm btn-danger" onclick="(${updateStatus.toString()})('${r._id}', 'rejected')">Reject</button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
      }
    </div>
  `;
};
