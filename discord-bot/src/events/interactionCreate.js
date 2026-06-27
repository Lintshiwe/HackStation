module.exports = async (interaction, client) => {
  if (interaction.isChatInputCommand()) {
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
    return;
  }

  if (interaction.isButton()) {
    const [action, ...params] = interaction.customId.split(':');
    try {
      const handler = client.buttons?.get(action);
      if (handler) await handler(interaction, params);
    } catch (err) {
      console.error(`Error handling button ${interaction.customId}:`, err);
      await interaction.reply({ content: 'Error handling interaction.', ephemeral: true });
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    const [action] = interaction.customId.split(':');
    try {
      const handler = client.modals?.get(action);
      if (handler) await handler(interaction);
    } catch (err) {
      console.error(`Error handling modal ${interaction.customId}:`, err);
      await interaction.reply({ content: 'Error handling interaction.', ephemeral: true });
    }
  }
};
