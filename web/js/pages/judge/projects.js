window.judgePages = window.judgePages || {};
const EVENT_ID = 'default';

window.judgePages.renderProjects = async function() {
  const judge = convex.getCurrentUser();
  const judgeId = judge?.userId;

  const [groups, scores] = await Promise.all([
    convex.query('groups:listByEvent', { eventId: EVENT_ID }).catch(() => []),
    convex.query('scores:listByJudge', { judgeId, eventId: EVENT_ID }).catch(() => []),
  ]);

  const scoreMap = {};
  (scores || []).forEach(s => { scoreMap[s.groupId] = s; });

  return `
    <div class="page-header">
      <div>
        <h2>Projects</h2>
        <p class="text-muted">Review and score hackathon projects</p>
      </div>
      <div class="stat-badge">
        <i data-lucide="folder-open" style="width: 16px; height: 16px;"></i>
        <span>${groups.length} project${groups.length !== 1 ? 's' : ''}</span>
      </div>
    </div>

    ${groups.length === 0 ? Utils.emptyState('No projects yet', 'Projects will appear once groups are formed') : `
    <div class="project-cards">
      ${groups.map(g => {
        const existingScore = scoreMap[g._id];
        const scored = !!existingScore;
        const totalScore = existingScore ? existingScore.total : null;
        return `
        <div class="card project-card" onclick="judgePages.setGroupId('${g._id}'); router.navigate('/judge/score')" style="cursor: pointer;">
          <div class="card-header">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
              <div class="avatar">${Utils.getInitials(g.name)}</div>
              <div style="flex: 1;">
                <h3>${Utils.escapeHtml(g.name)}</h3>
                <p class="text-muted">${g.project ? Utils.escapeHtml(g.project) : 'No project name'}</p>
              </div>
            </div>
            <div style="text-align: right;">
              ${scored ? `
                <div class="score-display">
                  <span class="score-value">${totalScore}</span>
                  <span class="text-muted" style="font-size: 12px;">/ ${existingScore.maxTotal || 100}</span>
                </div>
                <span class="badge badge-success">Scored</span>
              ` : `
                <span class="badge badge-warning">Not scored</span>
              `}
            </div>
          </div>
          <div class="card-body">
            <div class="member-chips">
              ${(g.members || []).map(m => `
                <span class="chip">${Utils.escapeHtml(m.name)}</span>
              `).join('')}
            </div>
            ${g.projectDescription ? `
              <p class="text-muted" style="margin-top: 8px; font-size: 13px;">${Utils.escapeHtml(g.projectDescription)}</p>
            ` : ''}
          </div>
          <div class="card-footer">
            <span class="btn btn-sm btn-ghost">
              <i data-lucide="star" style="width: 14px; height: 14px;"></i>
              ${scored ? 'View Score' : 'Score Project'}
            </span>
          </div>
        </div>`;
      }).join('')}
    </div>`}
  `;
};
