const HACKER_EVENT_ID = 'placeholder-event-id';

window.hackerPages = window.hackerPages || {};

window.hackerPages.renderHome = async function () {
  let timer, announcements, teams, nextItem;

  try {
    timer = await convex.query('queries/timer:getTimer', { eventId: HACKER_EVENT_ID });
  } catch (e) { timer = null; }

  try {
    announcements = await convex.query('queries/announcements:listByEvent', { eventId: HACKER_EVENT_ID });
  } catch (e) { announcements = []; }

  try {
    teams = await convex.query('queries/groups:listMyGroups', {});
  } catch (e) { teams = []; }

  try {
    const scheduleItems = await convex.query('queries/schedule:listByEvent', { eventId: HACKER_EVENT_ID });
    const now = Date.now();
    nextItem = scheduleItems.find(s => new Date(s.startTime).getTime() > now) || scheduleItems[0] || null;
  } catch (e) { nextItem = null; }

  const team = teams.length > 0 ? teams[0] : null;

  const phase = timer?.phase ? Utils.escapeHtml(timer.phase) : 'No active event';
  const timeDisplay = timer?.remainingMs != null
    ? Utils.formatTime(timer.remainingMs)
    : '--:--:--';

  const annList = announcements.length > 0
    ? announcements.slice(0, 3).map(a => `
      <div class="announcement-item">
        <div class="announcement-title">${Utils.escapeHtml(a.title)}</div>
        <div class="announcement-body">${Utils.escapeHtml(a.body || a.content || '')}</div>
        <div class="announcement-time">${Utils.formatDate(a.createdAt || a._creationTime)}</div>
      </div>
    `).join('')
    : '<div class="text-muted" style="padding: 16px 0;">No announcements yet</div>';

  const teamCard = team ? `
    <div class="card">
      <div class="card-header">
        <h4>${Utils.escapeHtml(team.name || team.groupName || 'My Team')}</h4>
      </div>
      <div class="card-body">
        ${team.members?.length > 0 ? `
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${team.members.map(m => `
              <div class="avatar avatar-sm" title="${Utils.escapeHtml(m.name || m.email)}">${Utils.getInitials(m.name || m.email)}</div>
            `).join('')}
          </div>
        ` : '<div class="text-muted">No members</div>'}
        ${team.project ? `<p style="margin-top: 12px; font-size: 13px; color: var(--text-secondary);">${Utils.escapeHtml(team.project)}</p>` : ''}
      </div>
    </div>
  ` : '';

  const nextSchedule = nextItem ? `
    <div class="card" style="margin-top: 16px;">
      <div class="card-header">
        <h4>Next Up</h4>
      </div>
      <div class="card-body">
        <div style="font-weight: 600;">${Utils.escapeHtml(nextItem.title)}</div>
        <div class="text-muted" style="margin-top: 4px;">${Utils.formatDate(nextItem.startTime)}</div>
      </div>
    </div>
  ` : '';

  return `
    <div style="max-width: 800px;">
      <h2>Hacker Home</h2>
      <p class="text-muted" style="margin-bottom: 24px;">Welcome to HackStation</p>

      <div class="card" style="text-align: center; padding: 32px;">
        <div class="timer-phase">${phase}</div>
        <div class="timer-display">${timeDisplay}</div>
      </div>

      ${teamCard}
      ${nextSchedule}

      <div class="card" style="margin-top: 16px;">
        <div class="card-header">
          <h4>Latest Announcements</h4>
        </div>
        <div class="card-body">
          ${annList}
        </div>
      </div>

      <div style="margin-top: 24px;">
        <button class="btn btn-primary" onclick="router.navigate('/hacker/help')">
          <i data-lucide="help-circle" style="width: 16px; height: 16px;"></i>
          Need Help?
        </button>
      </div>
    </div>
  `;
};
