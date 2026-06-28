const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const http = require('http');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const eventFn = require(`./events/${file}`);
  const eventName = file.replace('.js', '');
  client.on(eventName, (...args) => eventFn(...args, client));
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing ${interaction.commandName}:`, err);
    const reply = { content: 'There was an error executing this command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel.name === 'help-requests') {
    const { default: convex } = await import('./convex-client');
    try {
      await convex.mutation('mutations/alerts:createAlert', {
        content: message.content,
        authorId: message.author.id,
        authorName: message.author.username,
        channelId: message.channel.id,
        messageId: message.id,
      });
    } catch (err) {
      console.error('Failed to create alert from help message:', err);
    }
  }
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', bot: client.user?.tag || 'connecting' }));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Health server running on port ${PORT}`));

client.login(config.token);
