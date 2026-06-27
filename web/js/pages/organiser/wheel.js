window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderWheel = async function () {
  const members = await convex.query('events:getMembers', { eventId: EVENT_ID }).catch(() => []);

  const names = members.map(m => m.name || 'Unknown');

  return `
    <div class="page-header">
      <div>
        <h1>Spin Wheel</h1>
        <p class="text-muted">Randomly select a participant</p>
      </div>
    </div>

    ${names.length < 2
      ? Utils.emptyState('Not enough participants', 'Add at least 2 participants to use the spinner.')
      : `
    <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
      <div style="position: relative; flex-shrink: 0;">
        <canvas id="spinCanvas" width="400" height="400" style="border-radius: 50%; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"></canvas>
        <div style="position: absolute; top: 50%; right: -16px; transform: translateY(-50%); width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-right: 20px solid var(--accent); z-index: 2;"></div>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <button class="btn btn-primary btn-lg" id="spinBtn" style="width: 100%; justify-content: center; margin-bottom: 16px;">
          <i data-lucide="refresh-cw" style="width: 20px; height: 20px;"></i> Spin!
        </button>
        <div id="winnerDisplay" style="display: none; text-align: center; padding: 24px; background: var(--bg-secondary); border-radius: 12px;">
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Winner</div>
          <div id="winnerName" style="font-size: 24px; font-weight: 700; color: var(--accent);"></div>
        </div>
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 8px;">Participants (${names.length})</h4>
          <div style="max-height: 240px; overflow-y: auto;">
            ${names.map(n => `
              <div style="padding: 4px 0; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                <span class="avatar avatar-xs">${Utils.getInitials(n)}</span>
                ${Utils.escapeHtml(n)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    `
    }
  `;
};

// Wheel spin logic — called after render via an init script
window.organiserPages.initWheel = function () {
  const canvas = document.getElementById('spinCanvas');
  if (!canvas) return;

  const members = JSON.parse(canvas.dataset.members || '[]');
  if (members.length < 2) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
  const count = members.length;
  const arc = (2 * Math.PI) / count;
  let currentAngle = 0;
  let spinning = false;
  let animationId = null;

  function draw(angle) {
    ctx.clearRect(0, 0, 400, 400);
    for (let i = 0; i < count; i++) {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, 190, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(200, 200);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(members[i].substring(0, 12), 175, 4);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(200, 200, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    document.getElementById('winnerDisplay').style.display = 'none';

    const spinDuration = 3000 + Math.random() * 2000;
    const totalRotation = 5 * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const startAngle = currentAngle;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      currentAngle = startAngle + totalRotation * ease;
      draw(currentAngle);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        spinning = false;
        const normalized = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.floor(((2 * Math.PI - normalized) % (2 * Math.PI)) / arc);
        const winner = members[idx % count];
        document.getElementById('winnerName').textContent = winner;
        document.getElementById('winnerDisplay').style.display = 'block';
      }
    }
    animationId = requestAnimationFrame(animate);
  }

  document.getElementById('spinBtn').addEventListener('click', spin);
  draw(0);
};
