# Deployment Guide

## Prerequisites

- Cloudflare account with Workers enabled
- Cloudflare KV namespace created
- Lark webhook URL (optional, for notifications)

## Step 1: Configure Cloudflare KV

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "SO_KHOP_XO_SO"

# Note the namespace ID from output and update wrangler.toml
```

## Step 2: Update wrangler.toml

Replace `placeholder-kv-namespace-id` with your actual KV namespace ID:

```toml
[[kv_namespaces]]
binding = "KV"
id = "your-actual-kv-namespace-id"
```

## Step 3: Set Secrets

```bash
# Set admin secret for protected operations
wrangler secret put ADMIN_SECRET

# Set Lark webhook URL for notifications
wrangler secret put LARK_WEBHOOK_URL
```

## Step 4: Deploy Backend

```bash
# Install dependencies
pnpm install

# Build and deploy
pnpm build
wrangler deploy
```

## Step 5: Deploy Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Build production bundle
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=so-khop-xo-so
```

## Step 6: Configure Cron Triggers

The cron trigger is already configured in `wrangler.toml`:

```toml
[triggers]
crons = ["10 11 * * 3,6"]  # 18:10 GMT+7 on Wed & Sat
```

This will automatically trigger the fetch cycle at 18:10 GMT+7 on Wednesdays and Saturdays.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_SECRET` | Password for admin operations | Yes |
| `LARK_WEBHOOK_URL` | Webhook URL for win notifications | No |
| `ENVIRONMENT` | Environment name (development/production) | No |

## Monitoring

```bash
# View logs
wrangler tail

# View KV contents
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

## Troubleshooting

### KV Connection Issues

1. Verify namespace ID in `wrangler.toml`
2. Check Cloudflare dashboard for KV namespace status
3. Ensure `KV` binding is correct

### Cron Not Running

1. Verify cron expression in `wrangler.toml`
2. Check Cloudflare Workers dashboard for cron triggers
3. Test manually via `/api/v1/results/fetch`

### Webhook Failures

1. Verify `LARK_WEBHOOK_URL` secret is set
2. Check webhook URL format: `https://open.larksuite.com/open-apis/bot/v2/hook/xxx`
3. Test webhook manually with curl

## Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback
```
