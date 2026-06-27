const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./src/config');

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Request help')
    .addStringOption(opt => opt.setName('message').setDescription('Describe your issue').setRequired(true)),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show event timer'),
  new SlashCommandBuilder()
    .setName('team')
    .setDescription('Show your team'),
  new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Show event schedule'),
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link Discord to registration')
    .addStringOption(opt => opt.setName('discord_username').setDescription('Your Discord username').setRequired(true))
    .addStringOption(opt => opt.setName('email').setDescription('Your registration email').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Registering slash commands globally...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('Slash commands registered successfully!');
  } catch (err) {
    console.error(err);
  }
})();
