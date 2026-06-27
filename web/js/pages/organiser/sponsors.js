window.organiserPages = window.organiserPages || {};

const EVENT_ID = 'event1';

window.organiserPages.renderSponsors = async function () {
  const sponsors = await convex.query('sponsors:list', { eventId: EVENT_ID }).catch(() => []);

  function showSponsorForm(editSponsor) {
    const isEdit = !!editSponsor;
    Utils.showModal(`
      <div class="modal">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit' : 'Add'} Sponsor</h2>
          <button class="btn btn-ghost btn-sm" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="input" id="sponsorName" value="${isEdit ? Utils.escapeHtml(editSponsor.name) : ''}" placeholder="Sponsor name" required>
          </div>
          <div class="form-group">
            <label>Website</label>
            <input type="url" class="input" id="sponsorUrl" value="${isEdit ? Utils.escapeHtml(editSponsor.url || '') : ''}" placeholder="https://example.com">
          </div>
          <div class="form-group">
            <label>Tier</label>
            <select class="input" id="sponsorTier">
              <option value="gold" ${isEdit && editSponsor.tier === 'gold' ? 'selected' : ''}>Gold</option>
              <option value="silver" ${isEdit && editSponsor.tier === 'silver' ? 'selected' : ''}>Silver</option>
              <option value="bronze" ${isEdit && editSponsor.tier === 'bronze' ? 'selected' : ''}>Bronze</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Utils.closeModal(this.closest('.modal-backdrop'))">Cancel</button>
          <button class="btn btn-primary" id="saveSponsor">${isEdit ? 'Update' : 'Add'}</button>
        </div>
      </div>
    `);
    document.getElementById('saveSponsor').addEventListener('click', async () => {
      const name = document.getElementById('sponsorName').value.trim();
      const url = document.getElementById('sponsorUrl').value.trim();
      const tier = document.getElementById('sponsorTier').value;
      if (!name) {
        Utils.toast('Name is required', 'error');
        return;
      }
      try {
        if (isEdit) {
          await convex.mutation('sponsors:update', { sponsorId: editSponsor._id, name, url, tier });
        } else {
          await convex.mutation('sponsors:create', { eventId: EVENT_ID, name, url, tier });
        }
        Utils.toast(isEdit ? 'Sponsor updated' : 'Sponsor added', 'success');
        Utils.closeModal(document.querySelector('.modal-backdrop'));
        window.organiserPages.renderSponsors();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });
  }

  async function deleteSponsor(id) {
    if (!confirm('Remove this sponsor?')) return;
    try {
      await convex.mutation('sponsors:delete', { sponsorId: id });
      Utils.toast('Sponsor removed', 'success');
      window.organiserPages.renderSponsors();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  }

  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  const sorted = [...sponsors].sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9));

  const goldSponsors = sorted.filter(s => s.tier === 'gold');
  const silverSponsors = sorted.filter(s => s.tier === 'silver');
  const bronzeSponsors = sorted.filter(s => s.tier === 'bronze');

  return `
    <div class="page-header">
      <div>
        <h1>Sponsors</h1>
        <p class="text-muted">Manage event sponsors</p>
      </div>
      <button class="btn btn-primary" onclick="(${showSponsorForm.toString()})(null)">
        <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Add Sponsor
      </button>
    </div>

    ${sponsors.length === 0
      ? Utils.emptyState('No sponsors', 'Add your first sponsor to showcase them.')
      : `
        ${goldSponsors.length > 0 ? `
          <h3 style="margin-bottom: 12px;">Gold</h3>
          <div class="sponsor-grid sponsor-gold">
            ${goldSponsors.map(s => sponsorCard(s, 'gold', showSponsorForm, deleteSponsor)).join('')}
          </div>
        ` : ''}
        ${silverSponsors.length > 0 ? `
          <h3 style="margin: 24px 0 12px;">Silver</h3>
          <div class="sponsor-grid sponsor-silver">
            ${silverSponsors.map(s => sponsorCard(s, 'silver', showSponsorForm, deleteSponsor)).join('')}
          </div>
        ` : ''}
        ${bronzeSponsors.length > 0 ? `
          <h3 style="margin: 24px 0 12px;">Bronze</h3>
          <div class="sponsor-grid sponsor-bronze">
            ${bronzeSponsors.map(s => sponsorCard(s, 'bronze', showSponsorForm, deleteSponsor)).join('')}
          </div>
        ` : ''}
      `
    }
  `;
};

function sponsorCard(sponsor, tier, showForm, deleteFn) {
  const sizeClass = tier === 'gold' ? 'sponsor-lg' : tier === 'silver' ? 'sponsor-md' : 'sponsor-sm';
  return `
    <div class="card sponsor-card ${sizeClass}" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px;">
      <div style="width: 64px; height: 64px; border-radius: 12px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 24px; font-weight: 700; color: var(--text-secondary);">
        ${Utils.getInitials(sponsor.name)}
      </div>
      <h4 style="margin: 0 0 4px;">${Utils.escapeHtml(sponsor.name)}</h4>
      ${sponsor.url ? `<a href="${Utils.escapeHtml(sponsor.url)}" target="_blank" rel="noopener" style="font-size: 12px; color: var(--accent); text-decoration: none;">${Utils.escapeHtml(sponsor.url.replace(/^https?:\/\//, ''))}</a>` : ''}
      <div style="display: flex; gap: 4px; margin-top: 12px;">
        <button class="btn btn-ghost btn-sm" onclick="(${showForm.toString()})(${JSON.stringify(sponsor).replace(/'/g, "\\'")})">
          <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="(${deleteFn.toString()})('${sponsor._id}')" style="color: var(--danger);">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
    </div>
  `;
}
