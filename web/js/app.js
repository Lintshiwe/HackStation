const app = document.getElementById('app');

function renderLogin() {
  if (Auth.redirectOnLogin()) return;
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <img src="public/images/HacStationLogo.png" alt="HackStation">
          <h2 style="margin-top: 16px;">Welcome back</h2>
          <p class="text-muted">Sign in to your account</p>
        </div>
        <form id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="input" id="loginEmail" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="input" id="loginPassword" placeholder="Enter your password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;">Sign In</button>
        </form>
        <p style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
          Don't have an account? <a href="javascript:void(0)" onclick="router.navigate('/register')" style="color: var(--accent); text-decoration: none;">Register</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    Auth.handleLogin(email, password);
  });
}

function renderRegister() {
  if (Auth.redirectOnLogin()) return;
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <img src="public/images/HacStationLogo.png" alt="HackStation">
          <h2 style="margin-top: 16px;">Create account</h2>
          <p class="text-muted">Join HackStation</p>
        </div>
        <form id="registerForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="input" id="regName" placeholder="Your name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="input" id="regEmail" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="input" id="regPassword" placeholder="Create a password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;">Create Account</button>
        </form>
        <p style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
          Already have an account? <a href="javascript:void(0)" onclick="router.navigate('/login')" style="color: var(--accent); text-decoration: none;">Sign in</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    Auth.handleRegister(email, name, password);
  });
}

const navConfig = {
  hacker: {
    label: 'Hacker',
    items: [
      { path: '/hacker/home', label: 'Home', icon: 'home' },
      { path: '/hacker/chat', label: 'Chat', icon: 'message-square' },
      { path: '/hacker/team', label: 'My Team', icon: 'users' },
      { path: '/hacker/schedule', label: 'Schedule', icon: 'calendar' },
      { path: '/hacker/help', label: 'Help', icon: 'help-circle' },
    ],
  },
  organiser: {
    label: 'Organiser',
    items: [
      { path: '/organiser/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { path: '/organiser/groups', label: 'Groups', icon: 'users' },
      { path: '/organiser/registrations', label: 'Registrations', icon: 'clipboard-list' },
      { path: '/organiser/announcements', label: 'Announcements', icon: 'megaphone' },
      { path: '/organiser/timer', label: 'Timer', icon: 'clock' },
      { path: '/organiser/wheel', label: 'Wheel', icon: 'refresh-cw' },
      { path: '/organiser/judging', label: 'Judging', icon: 'star' },
      { path: '/organiser/schedule', label: 'Schedule', icon: 'calendar' },
      { path: '/organiser/alerts', label: 'Alerts', icon: 'bell' },
      { path: '/organiser/sponsors', label: 'Sponsors', icon: 'award' },
      { path: '/organiser/stats', label: 'Stats', icon: 'bar-chart-3' },
    ],
  },
  mentor: {
    label: 'Mentor',
    items: [
      { path: '/mentor/home', label: 'Home', icon: 'home' },
      { path: '/mentor/help-queue', label: 'Help Queue', icon: 'help-circle' },
      { path: '/mentor/groups', label: 'Groups', icon: 'users' },
    ],
  },
  judge: {
    label: 'Judge',
    items: [
      { path: '/judge/projects', label: 'Projects', icon: 'folder-open' },
      { path: '/judge/score', label: 'Score', icon: 'star' },
    ],
  },
};

function renderShell(pageContent) {
  const user = convex.getCurrentUser();
  if (!user) { router.navigate('/login'); return; }
  const role = user.role;
  const config = navConfig[role];
  if (!config) { app.innerHTML = '<p>Unknown role</p>'; return; }

  const currentPath = router.getCurrentPath();
  const navItems = config.items.map(item => {
    const active = currentPath === item.path ? 'active' : '';
    return `<a class="nav-item ${active}" onclick="router.navigate('${item.path}')">
      <i data-lucide="${item.icon}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
      <span class="nav-label">${item.label}</span>
    </a>`;
  }).join('');

  app.innerHTML = `
    <div class="app-shell">
      <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <img src="public/images/HacStationLogo.png" alt="HS">
          <span class="brand-name">HackStation</span>
        </div>
        <div class="sidebar-nav">
          <div class="nav-section-label">${config.label}</div>
          ${navItems}
        </div>
        <div class="sidebar-footer">
          <div class="nav-item" onclick="Auth.handleLogout()" style="cursor: pointer;">
            <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
            <span class="nav-label">Logout</span>
          </div>
        </div>
      </div>
      <div class="main-area">
        <div class="topbar">
          <button class="btn btn-ghost btn-sm" onclick="toggleSidebar()">
            <i data-lucide="menu" style="width: 18px; height: 18px;"></i>
          </button>
          <div style="flex: 1;"></div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="avatar avatar-sm">${Utils.getInitials(user.name)}</span>
            <span style="font-size: 13px; font-weight: 500;">${user.name}</span>
          </div>
        </div>
        <div class="content" id="pageContent">
          ${pageContent}
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// Role-based render helpers
async function renderWithShell(pageId, renderFn) {
  if (!Auth.requireAuth()) return;
  try {
    const content = await renderFn();
    renderShell(content);
  } catch (err) {
    renderShell(Utils.showError(err.message));
  }
}

const unknownPage = () => { app.innerHTML = '<div class="empty-state"><h3>404</h3><p>Page not found</p></div>'; };

// Register routes
router.register('/login', () => renderLogin());
router.register('/register', () => renderRegister());
router.register('/hacker/home', () => renderWithShell('hacker-home', window.hackerPages?.renderHome));
router.register('/hacker/chat', () => renderWithShell('hacker-chat', window.hackerPages?.renderChat));
router.register('/hacker/team', () => renderWithShell('hacker-team', window.hackerPages?.renderTeam));
router.register('/hacker/schedule', () => renderWithShell('hacker-schedule', window.hackerPages?.renderSchedule));
router.register('/hacker/help', () => renderWithShell('hacker-help', window.hackerPages?.renderHelp));
router.register('/organiser/dashboard', () => renderWithShell('organiser-dashboard', window.organiserPages?.renderDashboard));
router.register('/organiser/groups', () => renderWithShell('organiser-groups', window.organiserPages?.renderGroups));
router.register('/organiser/registrations', () => renderWithShell('organiser-registrations', window.organiserPages?.renderRegistrations));
router.register('/organiser/announcements', () => renderWithShell('organiser-announcements', window.organiserPages?.renderAnnouncements));
router.register('/organiser/timer', () => renderWithShell('organiser-timer', window.organiserPages?.renderTimer));
router.register('/organiser/wheel', () => renderWithShell('organiser-wheel', window.organiserPages?.renderWheel));
router.register('/organiser/judging', () => renderWithShell('organiser-judging', window.organiserPages?.renderJudging));
router.register('/organiser/schedule', () => renderWithShell('organiser-schedule', window.organiserPages?.renderSchedule));
router.register('/organiser/alerts', () => renderWithShell('organiser-alerts', window.organiserPages?.renderAlerts));
router.register('/organiser/sponsors', () => renderWithShell('organiser-sponsors', window.organiserPages?.renderSponsors));
router.register('/organiser/stats', () => renderWithShell('organiser-stats', window.organiserPages?.renderStats));
router.register('/mentor/home', () => renderWithShell('mentor-home', window.mentorPages?.renderHome));
router.register('/mentor/help-queue', () => renderWithShell('mentor-help', window.mentorPages?.renderHelpQueue));
router.register('/mentor/groups', () => renderWithShell('mentor-groups', window.mentorPages?.renderGroups));
router.register('/judge/projects', () => renderWithShell('judge-projects', window.judgePages?.renderProjects));
router.register('/judge/score', () => renderWithShell('judge-score', window.judgePages?.renderScore));

// Initialize
router.init();
