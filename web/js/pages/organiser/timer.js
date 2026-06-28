window.organiserPages = window.organiserPages || {};

var EVENT_ID = 'event1';

window.organiserPages.renderTimer = async function () {
  const timerData = await convex.query('events:getTimer', { eventId: EVENT_ID }).catch(() => null);

  function startTimer() {
    convex.mutation('timer:start', { eventId: EVENT_ID }).then(() => {
      Utils.toast('Timer started', 'success');
    }).catch(err => Utils.toast(err.message, 'error'));
  }

  function pauseTimer() {
    convex.mutation('timer:pause', { eventId: EVENT_ID }).then(() => {
      Utils.toast('Timer paused', 'info');
    }).catch(err => Utils.toast(err.message, 'error'));
  }

  function resumeTimer() {
    convex.mutation('timer:resume', { eventId: EVENT_ID }).then(() => {
      Utils.toast('Timer resumed', 'success');
    }).catch(err => Utils.toast(err.message, 'error'));
  }

  function showExtendDialog() {
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>Extend Phase</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Extra minutes</label>
            <input type="number" class="input" id="extendMinutes" value="5" min="1" max="120">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="confirmExtend">Extend</button>
        </div>
      </div>
    `);
    document.getElementById('confirmExtend').addEventListener('click', async () => {
      const minutes = parseInt(document.getElementById('extendMinutes').value);
      if (isNaN(minutes) || minutes < 1) return;
      try {
        await convex.mutation('timer:extend', { eventId: EVENT_ID, minutes });
        Utils.toast(`Extended by ${minutes} min`, 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  const remaining = timerData?.remaining ?? 0;
  const status = timerData?.status || 'stopped';
  const currentPhase = timerData?.currentPhase || 'Not started';
  const phases = timerData?.phases || [];

  return `
    <div class="page-header">
      <div>
        <h1>Timer</h1>
        <p class="text-muted">Event timer and phase management</p>
      </div>
    </div>

    <div class="card" style="text-align: center; padding: 40px;">
      <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">${Utils.escapeHtml(currentPhase)}</div>
      <div style="font-size: 64px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 4px; margin: 16px 0;">
        ${Utils.formatTime(remaining)}
      </div>
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        ${status === 'stopped' || status === 'paused'
          ? `<button class="btn btn-primary" onclick="(${startTimer.toString()})()">
              <i data-lucide="play" style="width: 18px; height: 18px;"></i> Start
            </button>`
          : `<button class="btn btn-warning" onclick="(${pauseTimer.toString()})()">
              <i data-lucide="pause" style="width: 18px; height: 18px;"></i> Pause
            </button>`
        }
        <button class="btn btn-secondary" onclick="(${showExtendDialog.toString()})()">
          <i data-lucide="plus-circle" style="width: 18px; height: 18px;"></i> Extend
        </button>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <h3>Phases</h3>
      ${phases.length === 0
        ? Utils.emptyState('No phases', 'Configure event phases to track progress.')
        : `<div class="phase-list">
          ${phases.map((p, i) => `
            <div class="card" style="margin-bottom: 8px; ${p.active ? 'border-color: var(--accent);' : ''}">
              <div class="card-body" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${Utils.escapeHtml(p.name)}</strong>
                  <span class="text-muted" style="margin-left: 8px;">${Utils.formatTime(p.duration)}</span>
                </div>
                ${p.active ? '<span class="badge badge-primary">Active</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>`
      }
    </div>
  `;
};
