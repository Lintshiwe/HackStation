window.organiserPages = window.organiserPages || {};

var EVENT_ID = 'event1';

window.organiserPages.renderAnnouncements = async function () {
  const announcements = await convex.query('announcements:list', { eventId: EVENT_ID }).catch(() => []);

  function showCreateForm() {
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>New Announcement</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input type="text" class="input" id="annTitle" placeholder="Announcement title" required>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea class="input" id="annContent" rows="4" placeholder="Write your announcement..." required></textarea>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select class="input" id="annPriority">
              <option value="low">Low</option>
              <option value="normal" selected>Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="submitAnnouncement">Send</button>
        </div>
      </div>
    `);

    document.getElementById('submitAnnouncement').addEventListener('click', async () => {
      const title = document.getElementById('annTitle').value.trim();
      const content = document.getElementById('annContent').value.trim();
      const priority = document.getElementById('annPriority').value;
      if (!title || !content) {
        Utils.toast('Title and content are required', 'error');
        return;
      }
      try {
        await convex.mutation('announcements:create', { eventId: EVENT_ID, title, content, priority });
        Utils.toast('Announcement sent', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderAnnouncements();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  return `
    <div class="page-header">
      <div>
        <h1>Announcements</h1>
        <p class="text-muted">Send and manage announcements</p>
      </div>
      <button class="btn btn-primary" onclick="(${showCreateForm.toString()})()">
        <i data-lucide="plus" style="width: 18px; height: 18px;"></i> New Announcement
      </button>
    </div>

    ${announcements.length === 0
      ? Utils.emptyState('No announcements', 'Create your first announcement to notify participants.')
      : `<div class="announcement-list">
        ${announcements.map(a => {
          const priorityClass = a.priority === 'urgent' ? 'badge-danger' :
            a.priority === 'high' ? 'badge-warning' :
            a.priority === 'low' ? 'badge-secondary' : 'badge-primary';
          return `
            <div class="card announcement-card" style="margin-bottom: 12px;">
              <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <h3 style="margin: 0;">${Utils.escapeHtml(a.title)}</h3>
                      <span class="badge ${priorityClass}">${a.priority || 'normal'}</span>
                    </div>
                    <p style="margin: 8px 0 0; white-space: pre-wrap;">${Utils.escapeHtml(a.content)}</p>
                  </div>
                  <small class="text-muted" style="white-space: nowrap;">${Utils.formatDate(a.createdAt)}</small>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>`
    }
  `;
};
