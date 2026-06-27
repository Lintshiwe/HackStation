const { EmbedBuilder } = require('discord.js');

function eventEmbed(eventData) {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(eventData.name || 'HackStation Event')
    .setDescription(eventData.description || '')
    .addFields(
      { name: 'Start', value: eventData.startTime ? new Date(eventData.startTime).toLocaleString() : 'TBD', inline: true },
      { name: 'End', value: eventData.endTime ? new Date(eventData.endTime).toLocaleString() : 'TBD', inline: true },
      { name: 'Location', value: eventData.location || 'TBD', inline: true },
    )
    .setTimestamp();
}

function scheduleEmbed(items) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Event Schedule')
    .setDescription('Here is the schedule for HackStation');

  if (items && items.length > 0) {
    items.forEach(item => {
      embed.addFields({
        name: `${item.time || 'TBD'} — ${item.title || 'Untitled'}`,
        value: item.description || 'No description',
        inline: false,
      });
    });
  } else {
    embed.setDescription('No schedule items available yet.');
  }

  return embed.setTimestamp();
}

function timerEmbed(timerData) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Event Status')
    .setTimestamp();

  if (!timerData) {
    return embed.setDescription('No active event timer.');
  }

  embed.addFields(
    { name: 'Phase', value: timerData.phase || 'Unknown', inline: true },
    { name: 'Remaining', value: timerData.remaining || 'N/A', inline: true },
  );

  if (timerData.description) {
    embed.setDescription(timerData.description);
  }

  return embed;
}

function teamEmbed(teamData) {
  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle(`Team: ${teamData.name || 'Unknown'}`)
    .setTimestamp();

  if (teamData.description) {
    embed.setDescription(teamData.description);
  }

  if (teamData.members && teamData.members.length > 0) {
    const memberList = teamData.members.map(m => `• ${m.name || m.username || m}`).join('\n');
    embed.addFields({ name: 'Members', value: memberList, inline: false });
  }

  if (teamData.project) {
    embed.addFields({ name: 'Project', value: teamData.project, inline: false });
  }

  return embed;
}

function helpEmbed(alertData) {
  return new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('Help Request')
    .setDescription(alertData.content || 'No description')
    .addFields(
      { name: 'From', value: alertData.authorName || 'Unknown', inline: true },
      { name: 'Channel', value: `<#${alertData.channelId}>`, inline: true },
    )
    .setTimestamp();
}

module.exports = { eventEmbed, scheduleEmbed, timerEmbed, teamEmbed, helpEmbed };
