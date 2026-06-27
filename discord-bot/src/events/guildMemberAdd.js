const convex = require('../convex-client');

module.exports = async (member, client) => {
  try {
    const discordState = await convex.query('queries/discord:getDiscordState');
    const hackerRoleId = discordState?.roles?.hacker;
    if (hackerRoleId) {
      await member.roles.add(hackerRoleId);
      console.log(`Assigned hacker role to ${member.user.tag}`);
    }
  } catch (err) {
    console.error(`Failed to assign role to ${member.user.tag}:`, err);
  }
};
