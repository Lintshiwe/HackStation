window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderSchedule = async function () {
  const items = await convex.query('schedule:list', { eventId: EVENT_ID }).catch(() => []);

  function showItemForm(editItem) {
    const isEdit = !!editItem;
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit' : 'Add'} Schedule Item</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input type="text" class="input" id="schedTitle" value="${isEdit ? Utils.escapeHtml(editItem.title) : ''}" placeholder="e.g. Opening Ceremony" required>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" class="input" id="schedLocation" value="${isEdit ? Utils.escapeHtml(editItem.location || '') : ''}" placeholder="Main Hall">
          </div>
          <div class="form-group">
            <label>Speaker</label>
            <input type="text" class="input" id="schedSpeaker" value="${isEdit ? Utils.escapeHtml(editItem.speaker || '') : ''}" placeholder="Speaker name">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>Start Time</label>
              <input type="datetime-local" class="input" id="schedStart" value="${isEdit ? editItem.startTime?.slice(0, 16) : ''}" required>
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="datetime-local" class="input" id="schedEnd" value="${isEdit ? editItem.endTime?.slice(0, 16) : ''}" required>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="saveScheduleItem">${isEdit ? 'Update' : 'Add'}</button>
        </div>
      </div>
    `);
    document.getElementById('saveScheduleItem').addEventListener('click', async () => {
      const title = document.getElementById('schedTitle').value.trim();
      const location = document.getElementById('schedLocation').value.trim();
      const speaker = document.getElementById('schedSpeaker').value.trim();
      const startTime = document.getElementById('schedStart').value;
      const endTime = document.getElementById('schedEnd').value;
      if (!title || !startTime || !endTime) {
        Utils.toast('Title, start and end time are required', 'error');
        return;
      }
      try {
        if (isEdit) {
          await convex.mutation('schedule:update', { itemId: editItem._id, title, location, speaker, startTime, endTime });
        } else {
          await convex.mutation('schedule:create', { eventId: EVENT_ID, title, location, speaker, startTime, endTime });
        }
        Utils.toast(isEdit ? 'Item updated' : 'Item added', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderSchedule();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  async function deleteItem(id) {
    if (!confirm('Delete this schedule item?')) return;
    try {
      await convex.mutation('schedule:delete', { itemId: id });
      Utils.toast('Item deleted', 'success');
      window.organiserPages.renderSchedule();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  return `
    <div class="page-header">
      <div>
        <h1>Schedule</h1>
        <p class="text-muted">Manage event schedule</p>
      </div>
      <button class="btn btn-primary" onclick="(${showItemForm.toString()})(null)">
        <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Add Item
      </button>
    </div>

    ${items.length === 0
      ? Utils.emptyState('No schedule items', 'Add your first schedule item to build the timeline.')
      : `<div class="schedule-timeline">
        ${items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(item => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="card" style="flex: 1;">
              <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="flex: 1;">
                    <h4 style="margin: 0;">${Utils.escapeHtml(item.title)}</h4>
                    <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
                      <span><i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${Utils.formatDate(item.startTime)} - ${Utils.formatDateShort(item.endTime)}</span>
                      ${item.location ? `<span><i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${Utils.escapeHtml(item.location)}</span>` : ''}
                      ${item.speaker ? `<span><i data-lucide="user" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${Utils.escapeHtml(item.speaker)}</span>` : ''}
                    </div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-ghost btn-sm" onclick="(${showItemForm.toString()})(${JSON.stringify(item).replace(/'/g, "\\'")})">
                      <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="(${deleteItem.toString()})('${item._id}')" style="color: var(--danger);">
                      <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>`
    }
  `;
};
