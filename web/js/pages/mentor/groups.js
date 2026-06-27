window.mentorPages = window.mentorPages || {};
const EVENT_ID = 'default';

window.mentorPages.renderGroups = async function() {
  const mentor = convex.getCurrentUser();
  const mentorId = mentor?.userId;

  const groups = await convex.query('groups:listByMentor', { mentorId, eventId: EVENT_ID }).catch(() => []);

  return `
    <div class="page-header">
      <div>
        <h2>My Groups</h2>
        <p class="text-muted">Groups assigned to you for mentorship</p>
      </div>
      <div class="stat-badge">
        <i data-lucide="users" style="width: 16px; height: 16px;"></i>
        <span>${groups.length} group${groups.length !== 1 ? 's' : ''}</span>
      </div>
    </div>

    ${groups.length === 0 ? Utils.emptyState('No groups assigned', 'You will be assigned groups once the event starts') : `
    <div class="group-cards">
      ${groups.map(g => `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="avatar">${Utils.getInitials(g.name)}</div>
            <div>
              <h3>${Utils.escapeHtml(g.name)}</h3>
              ${g.project ? `<p class="text-muted">${Utils.escapeHtml(g.project)}</p>` : '<p class="text-muted">No project yet</p>'}
            </div>
          </div>
        </div>
        <div class="card-body">
          <h4 style="margin-bottom: 12px; font-size: 14px;">Members</h4>
          ${g.members && g.members.length > 0 ? `
          <div class="member-list">
            ${g.members.map(m => `
            <div class="member-item">
              <div class="avatar avatar-sm">${Utils.getInitials(m.name)}</div>
              <div>
                <span style="font-weight: 500; font-size: 14px;">${Utils.escapeHtml(m.name)}</span>
                <span class="text-muted" style="font-size: 12px;">${Utils.escapeHtml(m.email || '')}</span>
              </div>
            </div>`).join('')}
          </div>` : '<p class="text-muted">No members</p>'}

          ${g.project ? `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
            <h4 style="margin-bottom: 8px; font-size: 14px;">Project Details</h4>
            <p style="font-size: 13px; color: var(--text-secondary);">${Utils.escapeHtml(g.projectDescription || 'No description')}</p>
            ${g.projectLink ? `<a href="${Utils.escapeHtml(g.projectLink)}" target="_blank" class="btn btn-sm btn-ghost" style="margin-top: 8px;">
              <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> Project Link
            </a>` : ''}
          </div>` : ''}
        </div>
      </div>`).join('')}
    </div>`}
  `;
};
