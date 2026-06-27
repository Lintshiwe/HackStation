async function assignRole(member, roleId) {
  if (!roleId) throw new Error('Role ID is required');
  const role = member.guild.roles.cache.get(roleId);
  if (!role) throw new Error(`Role ${roleId} not found`);
  await member.roles.add(role);
}

async function removeRole(member, roleId) {
  if (!roleId) throw new Error('Role ID is required');
  const role = member.guild.roles.cache.get(roleId);
  if (!role) throw new Error(`Role ${roleId} not found`);
  await member.roles.remove(role);
}

async function syncRoles(guild, eventId) {
  const convex = require('../convex-client');
  const discordState = await convex.query('queries/discord:getDiscordState', { eventId });
  if (!discordState?.roles) return;

  const roleMap = discordState.roles;
  const members = await guild.members.fetch();

  for (const [, member] of members) {
    for (const [roleName, roleId] of Object.entries(roleMap)) {
      if (!roleId) continue;
      const role = guild.roles.cache.get(roleId);
      if (!role) continue;

      const hasDiscordRole = member.roles.cache.has(roleId);
      const shouldHave = await checkShouldHaveRole(member, roleName, eventId);

      if (shouldHave && !hasDiscordRole) {
        await member.roles.add(role);
      } else if (!shouldHave && hasDiscordRole) {
        await member.roles.remove(role);
      }
    }
  }
}

async function checkShouldHaveRole(member, roleName, eventId) {
  const convex = require('../convex-client');
  if (roleName === 'hacker') return true;
  if (roleName === 'volunteer') {
    const result = await convex.query('queries/volunteers:checkVolunteer', {
      discordUserId: member.id,
      eventId,
    });
    return !!result;
  }
  return false;
}

module.exports = { assignRole, removeRole, syncRoles };
