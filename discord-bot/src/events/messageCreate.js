const convex = require('../convex-client');

module.exports = async (message, client) => {
  if (message.author.bot) return;

  if (message.channel.name === 'help-requests') {
    try {
      await convex.mutation('mutations/alerts:createAlert', {
        content: message.content,
        authorId: message.author.id,
        authorName: message.author.username,
        channelId: message.channel.id,
        messageId: message.id,
        guildId: message.guild.id,
      });
    } catch (err) {
      console.error('Failed to create alert from message:', err);
    }
  }
};
