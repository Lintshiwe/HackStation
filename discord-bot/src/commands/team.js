const { SlashCommandBuilder } = require('discord.js');
const convex = require('../convex-client');
const { teamEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Show your team'),
  async execute(interaction) {
    try {
      const groups = await convex.query('queries/groups:listMyGroups', {
        discordUserId: interaction.user.id,
      });
      if (!groups || groups.length === 0) {
        return interaction.reply({ content: 'You are not assigned to any team yet.', ephemeral: true });
      }
      const embed = teamEmbed(groups[0]);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Team command error:', err);
      await interaction.reply({ content: 'Failed to fetch team info.', ephemeral: true });
    }
  },
};
