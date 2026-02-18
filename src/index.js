import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Discord bot setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let notificationChannel = null;

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // Get the notification channel
  try {
    notificationChannel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    console.log(`✅ Connected to channel: ${notificationChannel.name}`);
  } catch (error) {
    console.error('❌ Could not fetch notification channel:', error.message);
  }
});

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user?.tag || 'not ready',
    uptime: process.uptime()
  });
});

// GitHub webhook endpoint for issues
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`📥 Received GitHub event: ${event}`);

  // Only handle issue events
  if (event === 'issues' && payload.action === 'opened') {
    const issue = payload.issue;

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`🐛 New Issue: ${issue.title}`)
      .setURL(issue.html_url)
      .setDescription(issue.body?.substring(0, 500) || 'No description provided')
      .addFields(
        { name: 'Reporter', value: issue.user.login, inline: true },
        { name: 'Issue #', value: `#${issue.number}`, inline: true },
        { name: 'Repository', value: payload.repository.name, inline: true }
      )
      .setTimestamp(new Date(issue.created_at))
      .setFooter({ text: 'Omnilyth Bug Tracker' });

    if (notificationChannel) {
      await notificationChannel.send({ embeds: [embed] });
      console.log(`✅ Sent notification for issue #${issue.number}`);
    }
  }

  res.sendStatus(200);
});

// Deployment announcement endpoint
app.post('/webhook/deployment', async (req, res) => {
  const { version, notes } = req.body;

  if (!version) {
    return res.status(400).json({ error: 'version is required' });
  }

  const embed = new EmbedBuilder()
    .setColor('#4ECDC4')
    .setTitle(`🚀 New Version Deployed: v${version}`)
    .setDescription(notes || 'No patch notes provided')
    .setTimestamp()
    .setFooter({ text: 'Omnilyth Deployment' });

  if (notificationChannel) {
    await notificationChannel.send({ embeds: [embed] });
    console.log(`✅ Sent deployment notification for v${version}`);
  }

  res.json({ success: true, version });
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webhook server listening on port ${PORT}`);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
