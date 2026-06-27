const HELP_EVENT_ID = 'placeholder-event-id';

window.hackerPages = window.hackerPages || {};

window.hackerPages.renderHelp = async function () {
  const currentUser = convex.getCurrentUser();
  let helpRequests = [];

  try {
    helpRequests = await convex.query('queries/help:listByUser', { eventId: HELP_EVENT_ID }) || [];
  } catch (e) { helpRequests = []; }

  helpRequests.sort((a, b) => new Date(b.createdAt || b._creationTime).getTime() - new Date(a.createdAt || a._creationTime).getTime());

  function getStatusBadge(status) {
    const s = (status || 'open').toLowerCase();
    const map = {
      open: 'badge badge-yellow',
      'in-progress': 'badge badge-blue',
      resolved: 'badge badge-green',
      closed: 'badge badge-red'
    };
    const cls = map[s] || 'badge badge-yellow';
    const label = s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
    return `<span class="${cls}">${label}</span>`;
  }

  async function submitHelpRequest() {
    const input = document.getElementById('helpMessageInput');
    const text = input?.value.trim();
    if (!text) {
      Utils.toast('Please enter a message', 'error');
      return;
    }

    const submitBtn = document.getElementById('helpSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await convex.mutation('mutations/help:createRequest', {
        eventId: HELP_EVENT_ID,
        message: text
      });
      if (input) input.value = '';
      Utils.toast('Help request submitted', 'success');
      const updated = await convex.query('queries/help:listByUser', { eventId: HELP_EVENT_ID }) || [];
      const list = document.getElementById('helpRequestList');
      if (list) {
        list.innerHTML = renderRequestList(updated);
      }
    } catch (err) {
      Utils.toast(err.message || 'Failed to submit', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function renderRequestList(requests) {
    if (requests.length === 0) {
      return '<div class="text-muted" style="padding: 16px 0;">You haven\'t submitted any help requests yet.</div>';
    }
    return requests.map(r => `
      <div class="help-queue-item">
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 4px;">${Utils.escapeHtml(r.message)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">
            ${Utils.formatDate(r.createdAt || r._creationTime)}
            ${r.assignedTo ? ` &middot; Assigned to ${Utils.escapeHtml(r.assignedToName || r.assignedTo)}` : ''}
          </div>
          ${r.response ? `<div style="margin-top: 8px; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; font-size: 13px;"><strong>Response:</strong> ${Utils.escapeHtml(r.response)}</div>` : ''}
        </div>
        <div>${getStatusBadge(r.status)}</div>
      </div>
    `).join('');
  }

  setTimeout(() => {
    const input = document.getElementById('helpMessageInput');
    const submitBtn = document.getElementById('helpSubmitBtn');
    submitBtn?.addEventListener('click', submitHelpRequest);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitHelpRequest();
      }
    });
  }, 0);

  return `
    <div style="max-width: 800px;">
      <h2>Help</h2>
      <p class="text-muted" style="margin-bottom: 24px;">Need assistance? Submit a help request and a mentor will reach out.</p>

      <div class="card">
        <div class="card-header">
          <h4>New Help Request</h4>
        </div>
        <div class="card-body">
          <div class="form-group" style="margin-bottom: 12px;">
            <textarea class="input textarea" id="helpMessageInput" placeholder="Describe what you need help with..." style="min-height: 100px;"></textarea>
          </div>
          <button class="btn btn-primary" id="helpSubmitBtn">
            <i data-lucide="send" style="width: 16px; height: 16px;"></i>
            Submit Request
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h4>Your Requests</h4>
          <span class="badge badge-blue">${helpRequests.length} total</span>
        </div>
        <div class="card-body" id="helpRequestList">
          ${renderRequestList(helpRequests)}
        </div>
      </div>
    </div>
  `;
};
