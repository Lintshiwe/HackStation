const { SlashCommandBuilder } = require('discord.js');
const convex = require('../convex-client');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Request help')
    .addStringOption(opt => opt.setName('message').setDescription('Describe your issue').setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    try {
      await convex.mutation('mutations/alerts:createAlert', {
        content: message,
        authorId: interaction.user.id,
        authorName: interaction.user.username,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      });
      await interaction.reply({ content: 'Help request sent! A volunteer will be with you shortly.', ephemeral: true });
    } catch (err) {
      console.error('Help command error:', err);
      await interaction.reply({ content: 'Failed to send help request. Please try again.', ephemeral: true });
    }
  },
};
