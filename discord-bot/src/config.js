const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  convexUrl: process.env.CONVEX_URL || 'http://localhost:8181',
  convexKey: process.env.CONVEX_ADMIN_KEY || '',
};
