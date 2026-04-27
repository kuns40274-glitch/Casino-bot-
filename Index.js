const {
  Client, GatewayIntentBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, SlashCommandBuilder,
  REST, Routes
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SIMPLE DATABASE =====
let users = {};

function getUser(id) {
  if (!users[id]) {
    users[id] = { balance: 1000 };
  }
  return users[id];
}

// ===== REGISTER COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('casino')
    .setDescription('Open casino menu')
];

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );
})();

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'casino') {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('slots').setLabel('🎰 Slots').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('balance').setLabel('💰 Balance').setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        content: "🎮 Casino Menu",
        components: [row]
      });
    }
  }

  if (!interaction.isButton()) return;

  const user = getUser(interaction.user.id);

  // BALANCE
  if (interaction.customId === 'balance') {
    return interaction.reply({
      content: `💰 Balance: ${user.balance} points ($${(user.balance/100).toFixed(2)})`,
      ephemeral: true
    });
  }

  // SLOTS
  if (interaction.customId === 'slots') {

    if (user.balance < 50) {
      return interaction.reply({ content: "❌ Need at least 50 points", ephemeral: true });
    }

    user.balance -= 50;

    let msg = await interaction.reply({
      content: "🎰 Spinning...",
      fetchReply: true
    });

    setTimeout(() => msg.edit("🎰 | 🍒 🍋 🍉"), 500);
    setTimeout(() => msg.edit("🎰 | 🍒 🍒 🍋"), 1000);

    setTimeout(() => {
      const win = Math.random() < 0.4;

      if (win) {
        user.balance += 100;
        msg.edit("🎰 🍒🍒🍒 🎉 You Win +100");
      } else {
        msg.edit("🎰 🍒🍋🍉 ❌ You Lost");
      }
    }, 2000);
  }

});

client.login(TOKEN);
