# Omnilyth Discord Bot

Discord bot that notifies about GitHub issues and deployments for the Omnilyth project.

## Features

- 🐛 **Bug Reports**: Automatically posts to Discord when new issues are opened on GitHub
- 🚀 **Deployment Notifications**: Announces new versions with patch notes
- 🔗 **Webhook-based**: Uses GitHub webhooks (no polling, instant notifications)

## Setup Guide

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name it "Omnilyth Bot"
3. Go to "Bot" section → Click "Add Bot"
4. Copy the **Token** (you'll need this)
5. Enable "Message Content Intent" (under Privileged Gateway Intents)
6. Go to "OAuth2" → "URL Generator"
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Embed Links`
7. Copy the generated URL and open it to invite bot to your server

### 2. Get Channel ID and Role ID

**Channel ID:**
1. Enable Discord Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click your notification channel → "Copy Channel ID"

**Role ID (optional - for @mentions):**
1. Create a role in your server (e.g., "Dev Team", "Bug Squad")
2. Right-click the role → "Copy Role ID"
   - Or type `\@RoleName` in chat to see the ID

### 3. Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# DISCORD_TOKEN=your_bot_token
# DISCORD_CHANNEL_ID=your_channel_id
# DISCORD_ROLE_ID=your_role_id (optional)

# Run locally
npm run dev
```

### 4. Deploy to Railway

1. Push this repo to GitHub
2. Go to [Railway.app](https://railway.app) → "New Project" → "Deploy from GitHub repo"
3. Select your bot repository
4. Add environment variables:
   - `DISCORD_TOKEN` (from Discord Developer Portal)
   - `DISCORD_CHANNEL_ID` (from Discord)
   - `DISCORD_ROLE_ID` (optional - for @mentions)
5. Railway will auto-deploy and provide a public URL (e.g., `https://your-bot.railway.app`)

### 5. Configure GitHub Webhook

1. Go to your `omnilyth-core-public` repository settings
2. Navigate to "Webhooks" → "Add webhook"
3. **Payload URL**: `https://your-bot.railway.app/webhook/github`
4. **Content type**: `application/json`
5. **Events**: Select "Issues" only
6. Save webhook

## Testing

### Test GitHub Issues
Create a test issue in your repo, and it should appear in Discord within seconds.

### Test Deployment Notifications
Use curl or any HTTP client:

```bash
curl -X POST https://your-bot.railway.app/webhook/deployment \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.2.0",
    "notes": "## What'\''s New\n- Fixed calculation bug\n- Improved UI performance\n- Added dark mode"
  }'
```

## Endpoints

- `GET /` - Health check (returns bot status)
- `POST /webhook/github` - Receives GitHub webhooks for issues
- `POST /webhook/deployment` - Manual deployment announcements

## Deployment Notification Format

Send POST to `/webhook/deployment`:
```json
{
  "version": "1.2.0",
  "notes": "## Patch Notes\n- Feature 1\n- Bug fix 2"
}
```

## Troubleshooting

**Bot offline?**
- Check Railway logs for errors
- Verify `DISCORD_TOKEN` is correct
- Ensure bot has been invited to server

**No notifications?**
- Verify GitHub webhook is configured correctly
- Check Railway URL is public and accessible
- Look at Railway logs for webhook hits

**Deployment notifications not working?**
- Test with curl command above
- Check Railway logs
- Verify channel ID is correct

## Cost

- Railway free tier: ~$5 credit/month (enough for this bot)
- Restarts if credits run out (bot goes offline until next month)
