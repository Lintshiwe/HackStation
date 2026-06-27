const SCHEDULE_EVENT_ID = 'placeholder-event-id';

window.hackerPages = window.hackerPages || {};

window.hackerPages.renderSchedule = async function () {
  let items = [];

  try {
    items = await convex.query('queries/schedule:listByEvent', { eventId: SCHEDULE_EVENT_ID }) || [];
  } catch (e) { items = []; }

  items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const now = Date.now();

  if (items.length === 0) {
    return `
      <div style="max-width: 800px;">
        <h2>Schedule</h2>
        <div class="empty-state" style="padding: 64px 32px;">
          <i data-lucide="calendar" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
          <h3>No Schedule Yet</h3>
          <p>The event schedule hasn't been published yet. Check back later.</p>
        </div>
      </div>
    `;
  }

  const timelineItems = items.map((item, idx) => {
    const startTime = new Date(item.startTime).getTime();
    const endTime = item.endTime ? new Date(item.endTime).getTime() : startTime;
    const isActive = startTime <= now && endTime >= now;
    const isPast = endTime < now;

    return `
      <div class="timeline-item ${isActive ? 'active' : ''}" style="opacity: ${isPast ? '0.5' : '1'};">
        <div class="time">${Utils.formatDateShort(item.startTime)}${item.endTime ? ' - ' + Utils.formatDateShort(item.endTime) : ''}</div>
        <div class="title" style="margin-top: 2px;">${Utils.escapeHtml(item.title)}</div>
        ${item.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${Utils.escapeHtml(item.description)}</div>` : ''}
        ${item.location ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;"><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${Utils.escapeHtml(item.location)}</div>` : ''}
        ${isActive ? '<span class="badge badge-green" style="margin-top: 4px;">Now</span>' : ''}
      </div>
    `;
  }).join('');

  return `
    <div style="max-width: 800px;">
      <h2>Schedule</h2>
      <p class="text-muted" style="margin-bottom: 24px;">Event timeline</p>

      <div class="card">
        <div class="timeline">
          ${timelineItems}
        </div>
      </div>
    </div>
  `;
};
