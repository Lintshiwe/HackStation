window.mentorPages = window.mentorPages || {};
var EVENT_ID = 'default';
let _filter = 'all';

async function reRender() {
  const el = document.getElementById('pageContent');
  if (el) {
    el.innerHTML = await window.mentorPages.renderHelpQueue();
    lucide.createIcons();
  }
}

window.mentorPages.renderHelpQueue = async function() {
  const mentor = convex.getCurrentUser();
  const mentorId = mentor?.userId;

  const helpRequests = await convex.query('helpRequests:listByEvent', { eventId: EVENT_ID }).catch(() => []);

  const filtered = _filter === 'all' ? helpRequests : helpRequests.filter(r => r.status === _filter);

  return `
    <div class="page-header">
      <div>
        <h2>Help Queue</h2>
        <p class="text-muted">View and manage help requests</p>
      </div>
      <div class="stat-badge">
        <i data-lucide="clock" style="width: 16px; height: 16px;"></i>
        <span>${helpRequests.filter(r => r.status === 'open').length} open</span>
      </div>
    </div>

    <div class="tab-bar">
      ${['all', 'open', 'assigned', 'resolved'].map(s => `
        <button class="tab-btn ${_filter === s ? 'active' : ''}" onclick="mentorPages.setFilter('${s}')">${s.charAt(0).toUpperCase() + s.slice(1)}</button>
      `).join('')}
    </div>

    <div class="card" style="margin-top: 16px;">
      <div class="card-body">
        ${filtered.length === 0 ? Utils.emptyState('No help requests', 'No requests match this filter') : `
        <div class="request-list">
          ${filtered.map(r => {
            const isOpen = r.status === 'open';
            const isAssigned = r.status === 'assigned';
            const isAssignedToMe = isAssigned && r.mentorId === mentorId;
            const badgeClass = isOpen ? 'warning' : isAssigned ? 'info' : 'success';
            return `
            <div class="request-item">
              <div class="request-info">
                <div class="request-header">
                  <strong>${Utils.escapeHtml(r.groupName || 'Unknown Group')}</strong>
                  <span class="badge badge-${badgeClass}">${r.status}</span>
                </div>
                <p class="request-topic">${Utils.escapeHtml(r.topic || 'No topic')}</p>
                <p class="request-desc text-muted">${Utils.escapeHtml(r.description || '')}</p>
                <span class="text-muted" style="font-size: 12px;">${Utils.formatDate(r._creationTime)}</span>
              </div>
              <div class="request-actions">
                ${isOpen ? `<button class="btn btn-primary btn-sm" onclick="mentorPages.acceptRequest('${r._id}')">
                  <i data-lucide="check" style="width: 14px; height: 14px;"></i> Accept
                </button>` : ''}
                ${isAssignedToMe ? `<button class="btn btn-success btn-sm" onclick="mentorPages.resolveRequest('${r._id}')">
                  <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Resolve
                </button>` : ''}
                ${isAssigned && !isAssignedToMe ? `<span class="text-muted" style="font-size: 12px;">Assigned to another mentor</span>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>
  `;
};

window.mentorPages.setFilter = function(filter) {
  _filter = filter;
  reRender();
};

window.mentorPages.acceptRequest = async function(requestId) {
  const mentor = convex.getCurrentUser();
  try {
    await convex.mutation('helpRequests:accept', { requestId, mentorId: mentor.userId });
    Utils.toast('Request accepted', 'success');
    reRender();
  } catch (err) {
    Utils.toast(err.message, 'error');
  }
};

window.mentorPages.resolveRequest = async function(requestId) {
  try {
    await convex.mutation('helpRequests:resolve', { requestId });
    Utils.toast('Request resolved', 'success');
    reRender();
  } catch (err) {
    Utils.toast(err.message, 'error');
  }
};
