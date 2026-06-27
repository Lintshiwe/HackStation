const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../src/config');
const convex = require('../src/convex-client');

const VOICE_CHANNEL_NAME = process.env.TIMER_VOICE_CHANNEL_NAME || '⏱ Event Timer';

let intervalHandle = null;

async function updateTimerChannel(client) {
  try {
    const timer = await convex.query('queries/timer:getTimer');
    if (!timer) return;

    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.find(
      c => c.type === 2 && c.name === VOICE_CHANNEL_NAME
    );
    if (!channel) return;

    const remaining = timer.remaining || 'N/A';
    const phase = timer.phase || '';
    const newName = `${phase} ${remaining}`.trim().slice(0, 100);

    if (channel.name !== newName) {
      await channel.setName(newName);
    }
  } catch (err) {
    console.error('Timer sync error:', err);
  }
}

async function start(client) {
  if (intervalHandle) return;
  await updateTimerChannel(client);
  intervalHandle = setInterval(() => updateTimerChannel(client), 30000);
}

function stop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = { start, stop };
