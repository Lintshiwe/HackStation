const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const convex = require('../convex-client');
const { timerEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show event timer'),
  async execute(interaction) {
    try {
      const timer = await convex.query('queries/timer:getTimer');
      const embed = timerEmbed(timer);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Status command error:', err);
      await interaction.reply({ content: 'Failed to fetch event status.', ephemeral: true });
    }
  },
};
