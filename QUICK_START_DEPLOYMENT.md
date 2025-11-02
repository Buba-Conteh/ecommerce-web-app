# Quick Start: Deploy to Render.com

Follow these steps to deploy your e-commerce app to Render in under 10 minutes.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Code pushed to GitHub repository
- [ ] Render.com account (sign up at render.com)

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy to Render

1. **Login to Render**: https://render.com
2. **Click**: "New +" → "Blueprint"
3. **Connect**: Your GitHub repository
4. **Render detects**: `render.yaml` automatically
5. **Review**: Service configuration
6. **Click**: "Apply"

Render will:
- Create PostgreSQL database
- Create Redis cache (optional)
- Deploy your web service
- Link all services together

## Step 3: Add Environment Variables

Go to your Web Service → Environment tab, add:

```env
# App Settings
APP_NAME=E-Commerce System
APP_URL=https://YOUR_APP_NAME.onrender.com

# Payment Gateways (get from Stripe/PayPal dashboards)
STRIPE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET=sk_test_YOUR_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

PAYPAL_CLIENT_ID=YOUR_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_CLIENT_SECRET
PAYPAL_SANDBOX=true

# Email (optional for now)
MAIL_MAILER=log
```

**Database variables are auto-filled** by Render!

## Step 4: Deploy!

Click **"Manual Deploy"** → **"Deploy latest commit"**

Wait 5-10 minutes for build to complete.

## Step 5: Test

Visit: `https://YOUR_APP_NAME.onrender.com`

## What's Included

✅ Multi-stage Docker build
✅ Nginx + PHP-FPM
✅ PostgreSQL database
✅ Redis cache
✅ Automatic migrations
✅ Health check endpoint
✅ Optimized assets
✅ Production-ready config

## Local Testing with Docker

Before deploying, test locally:

```bash
# Start all services
docker-compose up -d

# Run migrations
docker exec -it e-commerce-app php artisan migrate

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Verify all dependencies in composer.json/package.json

### 502 Error
- Check application logs
- Verify database connection
- Ensure migrations ran successfully

### Assets Not Loading
- Check build completed successfully
- Verify Vite configuration

## Next Steps

1. **Custom Domain**: Add your domain in Render settings
2. **SSL**: Automatically provisioned by Render
3. **Email**: Configure SMTP for production emails
4. **Monitoring**: Set up error tracking (Sentry)
5. **Backups**: Configure database backup schedule

## Need Help?

- 📖 Full guide: See `DEPLOYMENT.md`
- 🐳 Docker: See `docker-compose.yml`
- 🔧 Config: See `render.yaml`

## Cost

**Free Tier**: 750 hours/month (enough for testing)
**Production**: ~$14-24/month

- Web Service: $7/month
- PostgreSQL: $7/month  
- Redis: $10/month (optional)

## Quick Reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Container definition |
| `docker-compose.yml` | Local development |
| `render.yaml` | Render configuration |
| `.dockerignore` | Build optimization |
| `DEPLOYMENT.md` | Full deployment guide |

