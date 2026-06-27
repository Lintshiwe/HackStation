const config = require('../src/config');
const convex = require('../src/convex-client');

const ANNOUNCEMENTS_CHANNEL_NAME = process.env.ANNOUNCEMENTS_CHANNEL || 'announcements';
let lastCheckId = null;

async function pollAnnouncements(client) {
  try {
    const announcements = await convex.query('queries/announcements:listRecent', {
      afterId: lastCheckId,
    });

    if (!announcements || announcements.length === 0) return;

    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.find(
      c => c.type === 0 && c.name === ANNOUNCEMENTS_CHANNEL_NAME
    );
    if (!channel) return;

    for (const announcement of announcements) {
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(announcement.title || 'Announcement')
        .setDescription(announcement.content || '')
        .setTimestamp(new Date(announcement.createdAt));

      if (announcement.authorName) {
        embed.setFooter({ text: announcement.authorName });
      }

      await channel.send({ embeds: [embed] });
      lastCheckId = announcement._id;
    }
  } catch (err) {
    console.error('Announcement mirror error:', err);
  }
}

function start(client) {
  setInterval(() => pollAnnouncements(client), 15000);
}

module.exports = { start };
