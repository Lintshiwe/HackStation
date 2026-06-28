window.organiserPages = window.organiserPages || {};

var EVENT_ID = 'event1';

window.organiserPages.renderJudging = async function () {
  const [criteria, groups, leaderboard] = await Promise.all([
    convex.query('judging:getCriteria', { eventId: EVENT_ID }).catch(() => []),
    convex.query('groups:list', { eventId: EVENT_ID }).catch(() => []),
    convex.query('judging:getLeaderboard', { eventId: EVENT_ID }).catch(() => []),
  ]);

  function showCriterionForm(editCriterion) {
    const isEdit = !!editCriterion;
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit' : 'Add'} Criterion</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="input" id="criterionName" value="${isEdit ? Utils.escapeHtml(editCriterion.name) : ''}" placeholder="e.g. Innovation" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="input" id="criterionDesc" rows="3" placeholder="What to evaluate">${isEdit ? Utils.escapeHtml(editCriterion.description || '') : ''}</textarea>
          </div>
          <div class="form-group">
            <label>Weight (%)</label>
            <input type="number" class="input" id="criterionWeight" value="${isEdit ? editCriterion.weight : 20}" min="1" max="100">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="saveCriterion">${isEdit ? 'Update' : 'Add'}</button>
        </div>
      </div>
    `);
    document.getElementById('saveCriterion').addEventListener('click', async () => {
      const name = document.getElementById('criterionName').value.trim();
      const description = document.getElementById('criterionDesc').value.trim();
      const weight = parseInt(document.getElementById('criterionWeight').value);
      if (!name || isNaN(weight)) return;
      try {
        if (isEdit) {
          await convex.mutation('judging:updateCriterion', { criterionId: editCriterion._id, name, description, weight });
        } else {
          await convex.mutation('judging:addCriterion', { eventId: EVENT_ID, name, description, weight });
        }
        Utils.toast(isEdit ? 'Criterion updated' : 'Criterion added', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderJudging();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  async function deleteCriterion(id) {
    if (!confirm('Delete this criterion?')) return;
    try {
      await convex.mutation('judging:deleteCriterion', { criterionId: id });
      Utils.toast('Criterion deleted', 'success');
      window.organiserPages.renderJudging();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  function showAssignJudges() {
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>Assign Judges to Groups</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          ${groups.map(g => `
            <div class="form-group">
              <label>${Utils.escapeHtml(g.name)}</label>
              <input type="text" class="input judge-assign" data-group-id="${g._id}" placeholder="Judge name" value="${Utils.escapeHtml(g.assignedJudge || '')}">
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="saveAssignments">Save</button>
        </div>
      </div>
    `);
    document.getElementById('saveAssignments').addEventListener('click', async () => {
      const assignments = [];
      document.querySelectorAll('.judge-assign').forEach(input => {
        const name = input.value.trim();
        if (name) assignments.push({ groupId: input.dataset.groupId, judgeName: name });
      });
      try {
        await convex.mutation('judging:assignJudges', { eventId: EVENT_ID, assignments });
        Utils.toast('Assignments saved', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderJudging();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  return `
    <div class="page-header">
      <div>
        <h1>Judging</h1>
        <p class="text-muted">Manage criteria, assign judges, view leaderboard</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <div>
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Criteria</h3>
            <button class="btn btn-primary btn-sm" onclick="(${showCriterionForm.toString()})(null)">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Add
            </button>
          </div>
          <div class="card-body">
            ${criteria.length === 0
              ? Utils.emptyState('No criteria', 'Add judging criteria to evaluate projects.')
              : criteria.map(c => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                  <div>
                    <strong>${Utils.escapeHtml(c.name)}</strong>
                    ${c.description ? `<p style="margin: 2px 0 0; font-size: 12px; color: var(--text-secondary);">${Utils.escapeHtml(c.description)}</p>` : ''}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge">${c.weight}%</span>
                    <button class="btn btn-ghost btn-sm" onclick="(${showCriterionForm.toString()})(${JSON.stringify(c).replace(/'/g, "\\'")})">
                      <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="(${deleteCriterion.toString()})('${c._id}')" style="color: var(--danger);">
                      <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <div class="card" style="margin-top: 16px;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Judges</h3>
            <button class="btn btn-secondary btn-sm" onclick="(${showAssignJudges.toString()})()">
              <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i> Assign
            </button>
          </div>
          <div class="card-body">
            ${groups.length === 0
              ? Utils.emptyState('No groups', 'Create groups to assign judges.')
              : groups.map(g => `
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                  <span>${Utils.escapeHtml(g.name)}</span>
                  <span class="text-muted">${g.assignedJudge || 'Unassigned'}</span>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <h3>Leaderboard</h3>
          </div>
          <div class="card-body">
            ${leaderboard.length === 0
              ? Utils.emptyState('No scores yet', 'Scores will appear once judges start evaluating.')
              : `<table class="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Group</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${leaderboard.map((entry, i) => `
                    <tr>
                      <td><strong>#${i + 1}</strong></td>
                      <td>${Utils.escapeHtml(entry.groupName)}</td>
                      <td>${entry.totalScore?.toFixed(1) ?? '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
};
