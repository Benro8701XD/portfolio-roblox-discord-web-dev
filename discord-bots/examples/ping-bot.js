// Discord Ping Bot Example
// Install: npm install discord.js dotenv
// Create a .env file with: DISCORD_TOKEN=your_token_here

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "!ping") {
    message.reply("Pong! Bot is online.");
  }
});

client.login(process.env.DISCORD_TOKEN);
