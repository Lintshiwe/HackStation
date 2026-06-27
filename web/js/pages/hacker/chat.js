const CHAT_EVENT_ID = 'placeholder-event-id';

window.hackerPages = window.hackerPages || {};

window.hackerPages.renderChat = async function () {
  const currentUser = convex.getCurrentUser();
  let activeTab = 'community';
  let communityMessages = [];
  let teamMessages = [];

  try {
    communityMessages = await convex.query('queries/chat:getMessages', {
      eventId: CHAT_EVENT_ID,
      channel: 'community'
    }) || [];
  } catch (e) { communityMessages = []; }

  try {
    teamMessages = await convex.query('queries/chat:getMessages', {
      eventId: CHAT_EVENT_ID,
      channel: 'team'
    }) || [];
  } catch (e) { teamMessages = []; }

  function renderMessageList(messages) {
    if (messages.length === 0) {
      return '<div class="empty-state" style="padding: 32px;"><p>No messages yet. Start the conversation!</p></div>';
    }
    return messages.map(m => {
      const isOwn = m.userId === currentUser?.userId;
      const senderName = m.name || m.userName || 'Unknown';
      return `
        <div class="message ${isOwn ? 'own' : ''}">
          <div class="avatar avatar-sm">${Utils.getInitials(senderName)}</div>
          <div class="message-content">
            <div class="sender">${Utils.escapeHtml(senderName)}</div>
            <div class="text">${Utils.escapeHtml(m.content || m.text || '')}</div>
            <div class="message-time">${Utils.formatDateShort(m.createdAt || m._creationTime)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function switchTab(tab) {
    activeTab = tab;
    const msgContainer = document.getElementById('chatMessages');
    const communityTab = document.getElementById('communityTab');
    const teamTab = document.getElementById('teamTab');

    communityTab?.classList.toggle('active', tab === 'community');
    teamTab?.classList.toggle('active', tab === 'team');

    if (msgContainer) {
      if (tab === 'community') {
        msgContainer.innerHTML = renderMessageList(communityMessages);
      } else {
        msgContainer.innerHTML = renderMessageList(teamMessages);
      }
    }
  }

  setTimeout(() => {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    function sendMessage() {
      const text = input?.value.trim();
      if (!text) return;

      const channel = activeTab === 'community' ? 'community' : 'team';
      convex.mutation('mutations/chat:sendMessage', {
        eventId: CHAT_EVENT_ID,
        channel,
        content: text
      }).then(() => {
        if (input) input.value = '';
        Utils.toast('Message sent', 'success');
        if (channel === 'community') {
          return convex.query('queries/chat:getMessages', { eventId: CHAT_EVENT_ID, channel: 'community' });
        } else {
          return convex.query('queries/chat:getMessages', { eventId: CHAT_EVENT_ID, channel: 'team' });
        }
      }).then(updated => {
        if (channel === 'team') teamMessages = updated || [];
        else communityMessages = updated || [];
        const msgContainer = document.getElementById('chatMessages');
        if (msgContainer) {
          if (activeTab === 'community') msgContainer.innerHTML = renderMessageList(communityMessages);
          else msgContainer.innerHTML = renderMessageList(teamMessages);
        }
      }).catch(err => {
        Utils.toast(err.message || 'Failed to send', 'error');
      });
    }

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }, 0);

  return `
    <div style="max-width: 800px; height: 100%; display: flex; flex-direction: column;">
      <h2>Chat</h2>
      <div class="tabs" style="margin-top: 16px;">
        <button class="tab active" id="communityTab" onclick="window.hackerPages.renderChat.switchTab('community')">
          <i data-lucide="globe" style="width: 14px; height: 14px;"></i>
          Community
        </button>
        <button class="tab" id="teamTab" onclick="window.hackerPages.renderChat.switchTab('team')">
          <i data-lucide="users" style="width: 14px; height: 14px;"></i>
          My Team
        </button>
      </div>

      <div id="chatMessages" style="flex: 1; overflow-y: auto; padding: 16px 0;">
        ${renderMessageList(communityMessages)}
      </div>

      <div style="display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid var(--border);">
        <textarea class="input textarea" id="chatInput" placeholder="Type a message..." style="min-height: 44px; height: 44px; max-height: 120px; resize: none;"></textarea>
        <button class="btn btn-primary" id="chatSendBtn" style="flex-shrink: 0;">
          <i data-lucide="send" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
  `;
};

window.hackerPages.renderChat.switchTab = async function (tab) {
  const currentUser = convex.getCurrentUser();
  const msgContainer = document.getElementById('chatMessages');
  const communityTab = document.getElementById('communityTab');
  const teamTab = document.getElementById('teamTab');

  communityTab?.classList.toggle('active', tab === 'community');
  teamTab?.classList.toggle('active', tab === 'team');

  let messages = [];
  try {
    messages = await convex.query('queries/chat:getMessages', {
      eventId: CHAT_EVENT_ID,
      channel: tab
    }) || [];
  } catch (e) { messages = []; }

  if (msgContainer) {
    if (messages.length === 0) {
      msgContainer.innerHTML = '<div class="empty-state" style="padding: 32px;"><p>No messages yet. Start the conversation!</p></div>';
    } else {
      msgContainer.innerHTML = messages.map(m => {
        const isOwn = m.userId === currentUser?.userId;
        const senderName = m.name || m.userName || 'Unknown';
        return `
          <div class="message ${isOwn ? 'own' : ''}">
            <div class="avatar avatar-sm">${Utils.getInitials(senderName)}</div>
            <div class="message-content">
              <div class="sender">${Utils.escapeHtml(senderName)}</div>
              <div class="text">${Utils.escapeHtml(m.content || m.text || '')}</div>
              <div class="message-time">${Utils.formatDateShort(m.createdAt || m._creationTime)}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
};
