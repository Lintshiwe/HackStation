const { SlashCommandBuilder } = require('discord.js');
const convex = require('../convex-client');
const { scheduleEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Show event schedule'),
  async execute(interaction) {
    try {
      const items = await convex.query('queries/schedule:listByEvent');
      const embed = scheduleEmbed(items);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Schedule command error:', err);
      await interaction.reply({ content: 'Failed to fetch schedule.', ephemeral: true });
    }
  },
};
