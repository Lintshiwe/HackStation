const { ChannelType, PermissionsBitField } = require('discord.js');

async function createTeamChannel(guild, teamName) {
  const channelName = `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    topic: `Team ${teamName} discussion channel`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });
}

async function createVoiceChannel(guild, teamName) {
  const channelName = `vc-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });
}

async function deleteChannel(channelId) {
  const { Client } = require('discord.js');
  const config = require('../config');
  const client = new Client({ intents: [] });
  try {
    await client.login(config.token);
    const channel = await client.channels.fetch(channelId);
    if (channel) await channel.delete();
  } finally {
    client.destroy();
  }
}

module.exports = { createTeamChannel, createVoiceChannel, deleteChannel };
