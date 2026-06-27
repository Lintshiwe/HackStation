const { SlashCommandBuilder } = require('discord.js');
const convex = require('../convex-client');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link Discord to registration')
    .addStringOption(opt => opt.setName('discord_username').setDescription('Your Discord username').setRequired(true))
    .addStringOption(opt => opt.setName('email').setDescription('Your registration email').setRequired(true)),
  async execute(interaction) {
    const discordUsername = interaction.options.getString('discord_username');
    const email = interaction.options.getString('email');

    await interaction.deferReply({ ephemeral: true });

    try {
      const registrations = await convex.query('queries/registrations:listByEmail', { email });
      if (!registrations || registrations.length === 0) {
        return interaction.editReply('No registration found with that email address.');
      }

      const registration = registrations[0];
      await convex.mutation('mutations/registrations:linkDiscord', {
        registrationId: registration._id,
        discordUserId: interaction.user.id,
        discordUsername,
      });

      await convex.mutation('mutations/discord:updateDiscordState', {
        userId: interaction.user.id,
        username: discordUsername,
        email,
        roles: ['hacker'],
      });

      await interaction.editReply('Discord account linked successfully! You now have the hacker role.');
    } catch (err) {
      console.error('Link command error:', err);
      await interaction.editReply('Failed to link account. Please check your email and try again.');
    }
  },
};
