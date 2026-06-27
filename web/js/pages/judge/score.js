window.judgePages = window.judgePages || {};
const EVENT_ID = 'default';

let _groupId = null;

window.judgePages.setGroupId = function(id) {
  _groupId = id;
};

window.judgePages.renderScore = async function(groupId) {
  const judge = convex.getCurrentUser();
  const judgeId = judge?.userId;

  const targetId = groupId || _groupId;

  if (!targetId) {
    return Utils.emptyState('No project selected', 'Select a project from the projects page to score');
  }

  const [group, criteria, existingScore] = await Promise.all([
    convex.query('groups:get', { groupId: targetId }).catch(() => null),
    convex.query('judgingCriteria:listByEvent', { eventId: EVENT_ID }).catch(() => []),
    convex.query('scores:getByGroupAndJudge', { groupId: targetId, judgeId, eventId: EVENT_ID }).catch(() => null),
  ]);

  if (!group) {
    return Utils.emptyState('Project not found', 'The selected project could not be found');
  }

  return `
    <div class="page-header">
      <div>
        <h2>Score Project</h2>
        <p class="text-muted">${Utils.escapeHtml(group.name)}${group.project ? ' — ' + Utils.escapeHtml(group.project) : ''}</p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="router.navigate('/judge/projects')">
        <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Back to Projects
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Team Members</h3>
      </div>
      <div class="card-body">
        <div class="member-chips">
          ${(group.members || []).map(m => `
            <span class="chip">${Utils.escapeHtml(m.name)}</span>
          `).join('')}
        </div>
        ${group.projectDescription ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
            <h4 style="font-size: 14px; margin-bottom: 4px;">Description</h4>
            <p class="text-muted" style="font-size: 13px;">${Utils.escapeHtml(group.projectDescription)}</p>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <div class="card-header">
        <h3>Scoring Criteria</h3>
      </div>
      <div class="card-body">
        ${criteria.length === 0 ? Utils.emptyState('No criteria set', 'Judging criteria have not been configured yet') : `
        <form id="scoreForm" onsubmit="return false;">
          <div id="criteriaList">
            ${criteria.map((c, i) => `
            <div class="criterion-item" style="margin-bottom: 20px; ${i > 0 ? 'padding-top: 20px; border-top: 1px solid var(--border);' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                  <strong style="font-size: 14px;">${Utils.escapeHtml(c.name)}</strong>
                  ${c.description ? `<p class="text-muted" style="font-size: 12px; margin-top: 2px;">${Utils.escapeHtml(c.description)}</p>` : ''}
                </div>
                <div style="text-align: right;">
                  <span class="score-value" id="score_${i}_display">${existingScore?.criteriaScores?.[c.name] || 0}</span>
                  <span class="text-muted" style="font-size: 12px;">/ ${c.maxScore || 10}</span>
                </div>
              </div>
              <input type="range" class="range-input" id="score_${i}_slider"
                min="0" max="${c.maxScore || 10}" step="0.5"
                value="${existingScore?.criteriaScores?.[c.name] || 0}"
                oninput="judgePages.updateScoreDisplay(${i}, '${Utils.escapeHtml(c.name)}', ${c.maxScore || 10}, ${c.weight || 1})">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                <span>0</span>
                <span>${c.maxScore || 10}</span>
              </div>
              <input type="hidden" id="score_${i}_weight" value="${c.weight || 1}">
              <input type="hidden" id="score_${i}_max" value="${c.maxScore || 10}">
            </div>`).join('')}
          </div>

          <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 16px;">Weighted Total</strong>
              <div>
                <span class="score-value" id="totalScore" style="font-size: 24px;">
                  ${existingScore?.total || 0}
                </span>
                <span class="text-muted" style="font-size: 14px;"> / <span id="maxTotalScore">${criteria.reduce((sum, c) => sum + (c.maxScore || 10) * (c.weight || 1), 0)}</span></span>
              </div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <div class="form-group">
              <label>Feedback (optional)</label>
              <textarea class="input" id="scoreFeedback" rows="3" placeholder="Add notes or feedback for this project..." style="resize: vertical;">${Utils.escapeHtml(existingScore?.feedback || '')}</textarea>
            </div>
          </div>

          <div style="margin-top: 20px; display: flex; gap: 12px;">
            <button type="button" class="btn btn-primary btn-lg" onclick="judgePages.submitScore('${targetId}')" style="flex: 1; justify-content: center;">
              <i data-lucide="save" style="width: 16px; height: 16px;"></i>
              ${existingScore ? 'Update Score' : 'Submit Score'}
            </button>
            <button type="button" class="btn btn-ghost btn-lg" onclick="router.navigate('/judge/projects')" style="justify-content: center;">
              Cancel
            </button>
          </div>
        </form>`}
      </div>
    </div>
  `;
};

window.judgePages.updateScoreDisplay = function(index, name, maxScore, weight) {
  const slider = document.getElementById(`score_${index}_slider`);
  const display = document.getElementById(`score_${index}_display`);
  if (slider && display) {
    display.textContent = slider.value;
  }
  judgePages.updateTotal();
};

window.judgePages.updateTotal = function() {
  const criteriaList = document.getElementById('criteriaList');
  if (!criteriaList) return;

  const items = criteriaList.querySelectorAll('.criterion-item');
  let total = 0;
  let maxTotal = 0;

  items.forEach((item, i) => {
    const slider = document.getElementById(`score_${i}_slider`);
    const weightEl = document.getElementById(`score_${i}_weight`);
    const maxEl = document.getElementById(`score_${i}_max`);
    if (slider && weightEl && maxEl) {
      const score = parseFloat(slider.value) || 0;
      const weight = parseFloat(weightEl.value) || 1;
      const max = parseFloat(maxEl.value) || 10;
      total += score * weight;
      maxTotal += max * weight;
    }
  });

  const totalEl = document.getElementById('totalScore');
  const maxTotalEl = document.getElementById('maxTotalScore');
  if (totalEl) totalEl.textContent = total.toFixed(1);
  if (maxTotalEl) maxTotalEl.textContent = maxTotal.toFixed(1);
};

window.judgePages.submitScore = async function(groupId) {
  const judge = convex.getCurrentUser();
  const judgeId = judge?.userId;

  const criteriaList = document.getElementById('criteriaList');
  if (!criteriaList) return;

  const criteriaScores = {};
  const items = criteriaList.querySelectorAll('.criterion-item');
  let total = 0;

  items.forEach((item, i) => {
    const slider = document.getElementById(`score_${i}_slider`);
    const name = item.querySelector('strong')?.textContent || `Criterion ${i}`;
    const weightEl = document.getElementById(`score_${i}_weight`);
    const weight = parseFloat(weightEl?.value || '1');
    const score = parseFloat(slider?.value || '0');
    criteriaScores[name] = score;
    total += score * weight;
  });

  const feedback = document.getElementById('scoreFeedback')?.value || '';

  const maxTotal = criteriaList.querySelectorAll('.criterion-item').length * 10;

  try {
    await convex.mutation('scores:submit', {
      judgeId,
      groupId,
      eventId: EVENT_ID,
      criteriaScores,
      total: Math.round(total * 10) / 10,
      maxTotal,
      feedback,
    });
    Utils.toast('Score submitted successfully', 'success');
    router.navigate('/judge/projects');
  } catch (err) {
    Utils.toast(err.message, 'error');
  }
};
