window.hackerPages = window.hackerPages || {};

window.hackerPages.renderTeam = async function () {
  const currentUser = convex.getCurrentUser();
  let groups = [];

  try {
    groups = await convex.query('queries/groups:listMyGroups', {}) || [];
  } catch (e) { groups = []; }

  const team = groups.length > 0 ? groups[0] : null;

  if (!team) {
    return `
      <div style="max-width: 800px;">
        <h2>My Team</h2>
        <div class="empty-state" style="padding: 64px 32px;">
          <i data-lucide="users" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
          <h3>No Team Yet</h3>
          <p>You haven't joined a team yet. Check back later or contact an organiser.</p>
        </div>
      </div>
    `;
  }

  const members = team.members || [];
  const projectDesc = team.project || team.description || '';
  const repoUrl = team.repoUrl || team.repositoryUrl || '';
  const demoUrl = team.demoUrl || '';

  async function saveRepoUrl(url) {
    try {
      await convex.mutation('mutations/groups:updateGroup', {
        groupId: team._id,
        repoUrl: url
      });
      Utils.toast('Repository URL updated', 'success');
    } catch (e) {
      Utils.toast(e.message || 'Failed to update', 'error');
    }
  }

  async function saveDemoUrl(url) {
    try {
      await convex.mutation('mutations/groups:updateGroup', {
        groupId: team._id,
        demoUrl: url
      });
      Utils.toast('Demo URL updated', 'success');
    } catch (e) {
      Utils.toast(e.message || 'Failed to update', 'error');
    }
  }

  setTimeout(() => {
    const repoInput = document.getElementById('repoUrlInput');
    const repoBtn = document.getElementById('repoUrlSaveBtn');
    const demoInput = document.getElementById('demoUrlInput');
    const demoSaveBtn = document.getElementById('demoUrlSaveBtn');

    repoBtn?.addEventListener('click', () => {
      if (repoInput) saveRepoUrl(repoInput.value);
    });
    demoInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (demoInput) saveDemoUrl(demoInput.value); }
    });
    demoSaveBtn?.addEventListener('click', () => {
      if (demoInput) saveDemoUrl(demoInput.value);
    });
    repoInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (repoInput) saveRepoUrl(repoInput.value); }
    });
  }, 0);

  return `
    <div style="max-width: 800px;">
      <h2>${Utils.escapeHtml(team.name || team.groupName || 'My Team')}</h2>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h4>Team Members</h4>
          <span class="badge badge-blue">${members.length} members</span>
        </div>
        <div class="card-body">
          ${members.length > 0 ? members.map(m => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-light);">
              <div class="avatar avatar-sm">${Utils.getInitials(m.name || m.email)}</div>
              <div>
                <div style="font-size: 14px; font-weight: 500;">${Utils.escapeHtml(m.name || 'Unknown')}</div>
                <div class="text-muted">${Utils.escapeHtml(m.email || '')}</div>
              </div>
              ${m.role ? `<span class="badge badge-green">${Utils.escapeHtml(m.role)}</span>` : ''}
            </div>
          `).join('') : '<div class="text-muted">No members</div>'}
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <div class="card-header">
          <h4>Project</h4>
        </div>
        <div class="card-body">
          ${projectDesc
            ? `<p style="color: var(--text-primary); line-height: 1.6;">${Utils.escapeHtml(projectDesc)}</p>`
            : '<p class="text-muted">No project description yet.</p>'}
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <div class="card-header">
          <h4>Links</h4>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Repository URL</label>
            <div style="display: flex; gap: 8px;">
              <input type="url" class="input" id="repoUrlInput" value="${Utils.escapeHtml(repoUrl)}" placeholder="https://github.com/your-team/repo">
              <button class="btn btn-secondary btn-sm" id="repoUrlSaveBtn" style="flex-shrink: 0;">Save</button>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>Demo URL</label>
            <div style="display: flex; gap: 8px;">
              <input type="url" class="input" id="demoUrlInput" value="${Utils.escapeHtml(demoUrl)}" placeholder="https://your-demo.vercel.app">
              <button class="btn btn-secondary btn-sm" id="demoUrlSaveBtn" style="flex-shrink: 0;">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
