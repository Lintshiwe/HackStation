window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderGroups = async function () {
  const groups = await convex.query('groups:list', { eventId: EVENT_ID }).catch(() => []);

  function renderShuffleDialog() {
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>Shuffle Groups</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Mode</label>
            <select class="input" id="shuffleMode">
              <option value="random">Random</option>
              <option value="balanced">Balanced (skills)</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div class="form-group">
            <label>Min members per group</label>
            <input type="number" class="input" id="shuffleMin" value="3" min="1">
          </div>
          <div class="form-group">
            <label>Max members per group</label>
            <input type="number" class="input" id="shuffleMax" value="5" min="1">
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="preserveLeaders" checked>
              Preserve group leaders
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="triggerShuffle">Shuffle</button>
        </div>
      </div>
    `);
    document.getElementById('triggerShuffle').addEventListener('click', async () => {
      const mode = document.getElementById('shuffleMode').value;
      const min = parseInt(document.getElementById('shuffleMin').value);
      const max = parseInt(document.getElementById('shuffleMax').value);
      const preserveLeaders = document.getElementById('preserveLeaders').checked;
      try {
        await convex.mutation('groups:shuffle', { eventId: EVENT_ID, mode, minSize: min, maxSize: max, preserveLeaders });
        Utils.toast('Groups shuffled successfully', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderGroups();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  async function deleteGroup(groupId) {
    if (!confirm('Delete this group?')) return;
    try {
      await convex.mutation('groups:delete', { groupId });
      Utils.toast('Group deleted', 'success');
      window.organiserPages.renderGroups();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  return `
    <div class="page-header">
      <div>
        <h1>Groups</h1>
        <p class="text-muted">Manage participant groups</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="(${renderShuffleDialog.toString()})()">
          <i data-lucide="shuffle" style="width: 18px; height: 18px;"></i> Shuffle
        </button>
        <button class="btn btn-primary" id="createGroupBtn">
          <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Create Group
        </button>
      </div>
    </div>

    ${groups.length === 0
      ? Utils.emptyState('No groups yet', 'Create your first group to get started.')
      : `<div class="group-grid">
        ${groups.map(g => `
          <div class="card group-card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <h3>${Utils.escapeHtml(g.name)}</h3>
              <span class="badge">${g.memberCount ?? 0} members</span>
            </div>
            <div class="card-body">
              ${g.leader ? `<p><strong>Leader:</strong> ${Utils.escapeHtml(g.leader)}</p>` : ''}
              ${g.project ? `<p><strong>Project:</strong> ${Utils.escapeHtml(g.project)}</p>` : ''}
              ${g.mentor ? `<p><strong>Mentor:</strong> ${Utils.escapeHtml(g.mentor)}</p>` : ''}
            </div>
            <div class="card-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-ghost btn-sm" onclick="window.organiserPages.renderGroups()">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="(${deleteGroup.toString()})('${g._id}')" style="color: var(--danger);">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>`
    }
  `;
};
